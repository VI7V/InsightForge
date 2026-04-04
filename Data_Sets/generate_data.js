const fs = require('fs');

const feedbacks = [
  "Excellent product, very happy with my purchase!", "Shipping was slow but product quality is great.",
  "Customer service resolved my issue quickly.", "Product broke after one week, very disappointed.",
  "Amazing value for money, will buy again!", "The packaging was damaged but item was fine.",
  "Love this product, exceeded my expectations!", "Instructions were unclear but product works well.",
  "Fast delivery and great quality.", "Product doesn't match the description online.",
  "Fantastic experience from start to finish!", "Had issues with payment but resolved eventually.",
  "Best purchase I've made this year!", "Product is okay but not worth the price.",
  "Superb quality and quick shipping!", "Very poor customer service experience.",
  "Highly recommend to everyone!", "Product arrived late and was missing parts.",
  "Five stars for quality and service!", "Disappointed with the product durability.",
  "Great product, easy to use!", "Confusing setup process but works once done.",
  "Outstanding customer support team!", "Product stopped working after a month.",
  "Wonderful experience, very satisfied!", "Average product, nothing special.",
  "Top notch quality and fast delivery!", "Returned the product, wasn't as advertised.",
  "Absolutely love it, perfect product!", "Mediocre quality for the price paid.",
];

const customerNames = [
  "Alice Johnson","Bob Smith","Carol White","David Brown","Eva Martinez",
  "Frank Wilson","Grace Lee","Henry Taylor","Iris Chen","James Davis",
  "Karen Anderson","Liam Thomas","Mia Jackson","Noah Harris","Olivia Martin",
  "Peter Garcia","Quinn Robinson","Rachel Lewis","Samuel Walker","Tina Hall",
  "Uma Allen","Victor Young","Wendy King","Xavier Wright","Yara Scott",
  "Zoe Green","Aaron Baker","Beth Nelson","Chris Carter","Diana Mitchell",
  "Ethan Perez","Fiona Roberts","George Turner","Hannah Phillips","Ian Campbell",
  "Julia Parker","Kevin Evans","Laura Edwards","Mike Collins","Nancy Stewart",
  "Oscar Sanchez","Paula Morris","Quinn Rogers","Ryan Reed","Sara Cook",
  "Tom Morgan","Uma Bell","Victor Murphy","Wendy Bailey","Xavier Rivera",
];

const rows = ['date,customer_id,customer_name,sales_amount,product_category,region,purchase_frequency,recency_days,customer_lifetime_value,feedback_text,channel'];

const categories = ['Electronics','Clothing','Home & Garden','Sports','Books','Food & Beverage','Beauty','Toys','Automotive','Health'];
const regions = ['North','South','East','West','Central'];
const channels = ['Online','In-Store','Mobile App','Phone','Email'];

const startDate = new Date('2023-01-01');
let customerId = 1001;

for (let i = 0; i < 1200; i++) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + Math.floor(Math.random() * 730));
  const dateStr = date.toISOString().split('T')[0];
  
  const cid = `CUST${customerId++}`;
  const cname = customerNames[Math.floor(Math.random() * customerNames.length)];
  
  // Create seasonal + trend variation
  const month = date.getMonth();
  const seasonalFactor = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI);
  const trendFactor = 1 + (i / 1200) * 0.4;
  
  // Inject some anomalies
  let anomalyFactor = 1;
  if (i === 300 || i === 301 || i === 302) anomalyFactor = 3.5; // spike
  if (i === 600 || i === 601 || i === 602) anomalyFactor = 0.1; // drop
  
  const baseAmount = 200 + Math.random() * 800;
  const salesAmount = (baseAmount * seasonalFactor * trendFactor * anomalyFactor).toFixed(2);
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const channel = channels[Math.floor(Math.random() * channels.length)];
  const frequency = Math.floor(1 + Math.random() * 20);
  const recency = Math.floor(1 + Math.random() * 365);
  const clv = (parseFloat(salesAmount) * frequency * (1 - recency/1000)).toFixed(2);
  const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)].replace(/,/g, ';');
  
  rows.push(`${dateStr},${cid},"${cname}",${salesAmount},${category},${region},${frequency},${recency},${clv},"${feedback}",${channel}`);
}

fs.writeFileSync('/home/claude/ai-bi-platform/data/sales_data.csv', rows.join('\n'));
console.log(`Generated ${rows.length - 1} rows`);
