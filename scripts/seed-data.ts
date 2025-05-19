import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Utility function for calculating item status
function calculateItemStatus(quantity: number, reorderPoint: number): 'normal' | 'warning' | 'danger' {
  if (quantity <= 0) return 'danger';
  if (quantity <= reorderPoint) return 'warning';
  return 'normal';
}

const firebaseConfig = {
  apiKey: "AIzaSyAvwSooYRNlLR9bvrx_YbuRmJ-wON7p8gU",
  authDomain: "logismart-13227.firebaseapp.com",
  projectId: "logismart-13227",
  storageBucket: "logismart-13227.firebasestorage.app",
  messagingSenderId: "529654582979",
  appId: "1:529654582979:web:17983dabf677bb32ec9c76",
  measurementId: "G-CDRB17VWVW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const furnitureItems = [
  // Living Room Items
  {
    name: "Modern Sofa Set",
    category: "Living Room",
    quantity: 15,
    reorderPoint: 5,
    unit: "set",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Coffee Table",
    category: "Living Room",
    quantity: 20,
    reorderPoint: 7,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "TV Stand",
    category: "Living Room",
    quantity: 6,
    reorderPoint: 3,
    unit: "piece",
    status: "warning",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Console Table",
    category: "Living Room",
    quantity: 8,
    reorderPoint: 3,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Accent Chair",
    category: "Living Room",
    quantity: 12,
    reorderPoint: 4,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Side Table",
    category: "Living Room",
    quantity: 3,
    reorderPoint: 2,
    unit: "piece",
    status: "danger",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },

  // Bedroom Items
  {
    name: "Queen Size Bed",
    category: "Bedroom",
    quantity: 12,
    reorderPoint: 4,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Wardrobe",
    category: "Bedroom",
    quantity: 4,
    reorderPoint: 2,
    unit: "piece",
    status: "danger",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Nightstand",
    category: "Bedroom",
    quantity: 10,
    reorderPoint: 4,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Dresser",
    category: "Bedroom",
    quantity: 7,
    reorderPoint: 3,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },

  // Dining Room Items
  {
    name: "Dining Table",
    category: "Dining Room",
    quantity: 8,
    reorderPoint: 3,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Bar Stools",
    category: "Dining Room",
    quantity: 15,
    reorderPoint: 5,
    unit: "set",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Buffet Cabinet",
    category: "Dining Room",
    quantity: 5,
    reorderPoint: 2,
    unit: "piece",
    status: "warning",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },

  // Office Items
  {
    name: "Office Chair",
    category: "Office",
    quantity: 25,
    reorderPoint: 8,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Desk",
    category: "Office",
    quantity: 9,
    reorderPoint: 4,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Bookshelf",
    category: "Office",
    quantity: 10,
    reorderPoint: 4,
    unit: "piece",
    status: "normal",
    userId: "chitti14065@gmail.com",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Generate sales data for the past 4 weeks
const generateSalesData = () => {
  const sales = [];
  const today = new Date();
  const items = furnitureItems;
  
  // Generate 50 sales over the past 4 weeks
  for (let i = 0; i < 50; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1-3
    const salePrice = Math.floor(Math.random() * 1000) + 100; // Random price between 100-1100
    const saleDate = new Date(today);
    saleDate.setDate(today.getDate() - Math.floor(Math.random() * 28)); // Random date in past 4 weeks
    
    sales.push({
      itemId: item.name, // Using name as ID for simplicity
      itemName: item.name,
      category: item.category,
      quantity: quantity,
      salePrice: salePrice,
      totalValue: salePrice * quantity,
      saleDate: Timestamp.fromDate(saleDate),
      userId: "chitti14065@gmail.com",
      createdAt: Timestamp.now()
    });
  }
  
  return sales;
};

const salesData = generateSalesData();

async function seedData() {
  try {
    // Sign in with email and password
    console.log("Signing in to Firebase...");
    const userCredential = await signInWithEmailAndPassword(auth, "chitti14065@gmail.com", "Anitha");
    const userId = userCredential.user.uid;
    console.log("Successfully signed in! User ID:", userId);

    // Update all items with the correct userId
    const itemsWithUserId = furnitureItems.map(item => ({
      ...item,
      userId: userId
    }));

    // Add inventory items
    console.log("Adding inventory items...");
    for (const item of itemsWithUserId) {
      const docRef = await addDoc(collection(db, "inventoryItems"), item);
      console.log("Added item:", item.name, "with ID:", docRef.id);
    }

    // Update sales data with the correct userId
    const salesWithUserId = salesData.map(sale => ({
      ...sale,
      userId: userId
    }));

    // Add sales data
    console.log("Adding sales data...");
    for (const sale of salesWithUserId) {
      const docRef = await addDoc(collection(db, "salesHistory"), sale);
      console.log("Added sale for:", sale.itemName, "with ID:", docRef.id);
    }

    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedData(); 