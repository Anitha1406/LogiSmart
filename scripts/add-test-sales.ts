import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvwSooYRNlLR9bvrx_YbuRmJ-wON7p8gU",
  authDomain: "logismart-13227.firebaseapp.com",
  projectId: "logismart-13227",
  storageBucket: "logismart-13227.firebasestorage.app",
  messagingSenderId: "529654582979",
  appId: "1:529654582979:web:17983dabf677bb32ec9c76",
  measurementId: "G-CDRB17VWVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test items with their IDs
const testItems = [
  { id: '1', name: 'Sofa', category: 'Living Room' },
  { id: '2', name: 'Bed', category: 'Bedroom' },
  { id: '3', name: 'Dining Table', category: 'Dining Room' },
  { id: '4', name: 'Office Chair', category: 'Office' }
];

// Generate sales data for the past 4 months
const generateSalesData = () => {
  const sales = [];
  const today = new Date();
  
  // Generate sales for each item
  for (const item of testItems) {
    // Generate 6 sales records for each item (more than 4 required for prediction)
    for (let i = 0; i < 6; i++) {
      const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1-3
      const salePrice = Math.floor(Math.random() * 1000) + 100; // Random price between 100-1100
      
      // Create dates spread over the past 4 months
      const saleDate = new Date(today);
      saleDate.setMonth(today.getMonth() - Math.floor(i / 2)); // Spread over months
      saleDate.setDate(1 + (i % 2) * 15); // Either 1st or 15th of the month
      
      sales.push({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        quantity: quantity,
        salePrice: salePrice,
        totalValue: salePrice * quantity,
        saleDate: Timestamp.fromDate(saleDate),
        userId: 'chitti14065@gmail.com',
        createdAt: Timestamp.now()
      });
    }
  }
  
  return sales;
};

async function addTestSales() {
  try {
    // Sign in first
    console.log("Signing in to Firebase...");
    await signInWithEmailAndPassword(auth, "chitti14065@gmail.com", "Anitha");
    console.log("Successfully signed in!");

    const salesData = generateSalesData();
    
    // Add sales data
    console.log("Adding test sales data...");
    for (const sale of salesData) {
      const docRef = await addDoc(collection(db, "salesHistory"), sale);
      console.log(`Added sale for ${sale.itemName} on ${sale.saleDate.toDate().toLocaleDateString()}`);
    }

    console.log("Test sales data added successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the script
addTestSales(); 