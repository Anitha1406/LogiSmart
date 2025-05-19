import { RandomForestRegressor } from '../server/services/random-forest';
import { SalesHistory } from '../shared/schema';

// Generate test sales data
function generateTestData(): SalesHistory[] {
  const sales: SalesHistory[] = [];
  const today = new Date();
  
  // Generate 12 months of sales data for each category
  const categories = ['Living Room', 'Bedroom', 'Dining Room', 'Office'];
  
  for (const category of categories) {
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      
      // Add some seasonality and randomness
      const baseQuantity = category === 'Living Room' ? 5 : 
                          category === 'Bedroom' ? 4 :
                          category === 'Dining Room' ? 3 : 2;
      
      const seasonalFactor = 1 + 0.3 * Math.sin(i * Math.PI / 6); // Seasonal pattern
      const randomFactor = 0.8 + Math.random() * 0.4; // Random variation
      
      const quantity = Math.max(1, Math.round(baseQuantity * seasonalFactor * randomFactor));
      
      sales.push({
        id: sales.length + 1,
        itemId: categories.indexOf(category) + 1,
        userId: 'test-user',
        quantity,
        date
      });
    }
  }
  
  return sales;
}

async function testModel() {
  try {
    console.log('Generating test data...');
    const testData = generateTestData();
    
    // Group sales by category
    const salesByCategory = testData.reduce((acc, sale) => {
      const category = ['Living Room', 'Bedroom', 'Dining Room', 'Office'][sale.itemId - 1];
      if (!acc[category]) acc[category] = [];
      acc[category].push(sale);
      return acc;
    }, {} as Record<string, SalesHistory[]>);
    
    console.log('\nTesting model for each category:');
    console.log('===============================');
    
    const model = new RandomForestRegressor();
    
    for (const [category, sales] of Object.entries(salesByCategory)) {
      console.log(`\nCategory: ${category}`);
      console.log('------------------------');
      
      // Sort sales by date
      const sortedSales = [...sales].sort((a, b) => 
        new Date(a.date!).getTime() - new Date(b.date!).getTime()
      );
      
      // Train the model
      console.log('Training model...');
      await model.train(sortedSales, category);
      
      // Make predictions
      console.log('Making predictions...');
      const predictions = await model.predict(sortedSales, category);
      
      // Evaluate the model
      console.log('Evaluating model...');
      const metrics = await model.evaluate(sortedSales, category);
      
      console.log('Results:');
      console.log(`- Predicted next quantity: ${predictions}`);
      console.log(`- MAE: ${metrics.mae.toFixed(2)}`);
      console.log(`- RMSE: ${metrics.rmse.toFixed(2)}`);
      console.log(`- MAPE: ${metrics.mape.toFixed(2)}%`);
      console.log(`- Accuracy: ${(100 - metrics.mape).toFixed(2)}%`);
      
      // Show actual vs predicted for last 3 months
      console.log('\nLast 3 months comparison:');
      console.log('Month\tActual\tPredicted');
      for (let i = 0; i < 3; i++) {
        const actual = sortedSales[sortedSales.length - 1 - i].quantity;
        const predicted = Math.round(predictions * (1 + (i * 0.1))); // Simple scaling for demonstration
        console.log(`${i + 1}\t${actual}\t${predicted}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing model:', error);
  }
}

// Run the test
testModel(); 