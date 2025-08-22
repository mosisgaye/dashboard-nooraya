#!/usr/bin/env node

/**
 * Script pour créer des données de test dans la base de données
 * pour afficher des clients et réservations dans le dashboard
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://uhdsvroponkcqewlwwxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHN2cm9wb25rY3Fld2x3d3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDQ1ODksImV4cCI6MjA3MDM4MDU4OX0.EoKxmHqERwDnXUddtS7qaE3XuEFZaPNd-Wd3dVuuX9g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données de test
const testCustomers = [
  {
    name: 'Amadou Diallo',
    email: 'amadou.diallo@example.com',
    phone: '+221 77 123 45 67',
    type: 'VIP'
  },
  {
    name: 'Fatou Ndiaye',
    email: 'fatou.ndiaye@example.com',
    phone: '+221 78 234 56 78',
    type: 'regular'
  },
  {
    name: 'Ibrahim Sarr',
    email: 'ibrahim.sarr@example.com',
    phone: '+221 76 345 67 89',
    type: 'new'
  },
  {
    name: 'Mariam Faye',
    email: 'mariam.faye@example.com',
    phone: '+221 77 456 78 90',
    type: 'regular'
  },
  {
    name: 'Ousmane Diop',
    email: 'ousmane.diop@example.com',
    phone: '+221 78 567 89 01',
    type: 'VIP'
  }
];

// Créer des réservations de test
async function createTestBookings() {
  console.log('🚀 Création des données de test...\n');
  
  const bookings = [];
  const now = new Date();
  
  for (let i = 0; i < testCustomers.length; i++) {
    const customer = testCustomers[i];
    const bookingDate = new Date(now);
    bookingDate.setDate(now.getDate() - Math.floor(Math.random() * 30)); // Réservations des 30 derniers jours
    
    // Créer 1-3 réservations par client
    const numBookings = customer.type === 'VIP' ? 3 : (customer.type === 'regular' ? 2 : 1);
    
    for (let j = 0; j < numBookings; j++) {
      const travelDate = new Date(now);
      travelDate.setDate(now.getDate() + Math.floor(Math.random() * 60) + 30); // Voyages dans 30-90 jours
      
      const bookingTypes = ['flight', 'package', 'hotel'];
      const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      
      const destinations = [
        { from: 'Dakar', to: 'Paris' },
        { from: 'Dakar', to: 'Dubai' },
        { from: 'Dakar', to: 'Istanbul' },
        { from: 'Dakar', to: 'Makkah' },
        { from: 'Dakar', to: 'Lagos' }
      ];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      
      const booking = {
        id: `bk_${Math.random().toString(36).substr(2, 9)}_${i}_${j}`,
        guest_email: customer.email,
        guest_phone: customer.phone,
        booking_type: bookingType,
        status: j === 0 ? 'confirmed' : (Math.random() > 0.3 ? 'confirmed' : 'pending'),
        total_amount: Math.floor(Math.random() * 3000000) + 500000, // Entre 500k et 3.5M XOF
        currency: 'XOF',
        display_currency: 'XOF',
        base_amount: Math.floor(Math.random() * 2500000) + 400000,
        commission_percentage: 10,
        commission_amount: Math.floor(Math.random() * 300000) + 50000,
        passenger_details: {
          passengers: [
            {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              type: 'adult',
              passport: `SN${Math.floor(Math.random() * 900000) + 100000}`
            }
          ]
        },
        flight_details: bookingType === 'flight' ? {
          segments: [{
            origin: destination.from,
            destination: destination.to,
            departure_date: travelDate.toISOString().split('T')[0],
            airline: ['Air France', 'Turkish Airlines', 'Emirates', 'Royal Air Maroc'][Math.floor(Math.random() * 4)],
            flight_number: `AF${Math.floor(Math.random() * 900) + 100}`,
            cabin_class: customer.type === 'VIP' ? 'business' : 'economy'
          }]
        } : (bookingType === 'package' ? {
          package_type: 'Umra Premium',
          duration: '14 jours',
          hotel_makkah: 'Hilton Towers',
          hotel_madinah: 'Oberoi',
          departure_date: travelDate.toISOString().split('T')[0]
        } : {
          hotel_name: 'Radisson Blu',
          check_in: travelDate.toISOString().split('T')[0],
          check_out: new Date(travelDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          room_type: 'Deluxe Double'
        }),
        created_at: bookingDate.toISOString(),
        updated_at: bookingDate.toISOString()
      };
      
      bookings.push(booking);
    }
  }
  
  // Insérer les réservations
  console.log(`📝 Insertion de ${bookings.length} réservations...`);
  
  for (const booking of bookings) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select();
    
    if (error) {
      console.error(`❌ Erreur pour ${booking.guest_email}:`, error.message);
    } else {
      console.log(`✅ Réservation créée pour ${booking.guest_email} - ${booking.booking_type} - ${booking.total_amount.toLocaleString('fr-FR')} XOF`);
      
      // Créer un paiement pour les réservations confirmées
      if (booking.status === 'confirmed') {
        const payment = {
          id: `pay_${Math.random().toString(36).substr(2, 9)}`,
          booking_id: booking.id,
          amount: booking.total_amount,
          status: 'success',
          payment_method: ['Orange Money', 'Wave', 'PayTech', 'Carte Bancaire'][Math.floor(Math.random() * 4)],
          paytech_external_id: `PAY_${Date.now()}`,
          created_at: booking.created_at,
          updated_at: booking.created_at
        };
        
        const { error: paymentError } = await supabase
          .from('payments')
          .insert(payment);
        
        if (!paymentError) {
          console.log(`   💰 Paiement confirmé`);
        }
      }
    }
  }
  
  // Afficher les statistiques
  console.log('\n📊 Résumé des données créées:');
  console.log(`   - ${testCustomers.length} clients uniques`);
  console.log(`   - ${bookings.length} réservations`);
  console.log(`   - ${bookings.filter(b => b.status === 'confirmed').length} réservations confirmées`);
  console.log(`   - ${bookings.filter(b => b.booking_type === 'flight').length} vols`);
  console.log(`   - ${bookings.filter(b => b.booking_type === 'package').length} packages`);
  console.log(`   - ${bookings.filter(b => b.booking_type === 'hotel').length} hôtels`);
  
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_amount, 0);
  console.log(`   - Revenu total: ${totalRevenue.toLocaleString('fr-FR')} XOF`);
  
  console.log('\n✅ Données de test créées avec succès !');
  console.log('👉 Ouvrez le dashboard sur http://localhost:5174 pour voir les données');
}

// Exécuter le script
createTestBookings().catch(console.error);