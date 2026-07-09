const pinterestImages = [
  "https://i.pinimg.com/1200x/d4/38/8d/d4388d71d60de1cb50849bbca9e80e43.jpg",
  "https://i.pinimg.com/736x/98/d9/bb/98d9bbb90f9a224e2f27fa2b9cd143ec.jpg",
  "https://i.pinimg.com/736x/4e/ce/8c/4ece8c9872df146200d9cd1b2fe2fa12.jpg",
  "https://i.pinimg.com/736x/66/04/57/660457b139c25c3c039792b7d3557cf0.jpg",
  "https://i.pinimg.com/1200x/09/06/8c/09068cdc6a071fb6b23c4df7b3293ea6.jpg",
  "https://i.pinimg.com/736x/bf/fd/bc/bffdbc85c71897aa73ab32bb21a0f844.jpg",
  "https://i.pinimg.com/736x/f0/ca/fd/f0cafd5eb27ab14e2005a7b9083ca6c2.jpg",
  "https://i.pinimg.com/736x/d8/83/a7/d883a7bffd0d85fcb01ed53bc7befc93.jpg",
  "https://i.pinimg.com/736x/cf/4a/3a/cf4a3a9cca79ee017780ccab4bde2aff.jpg",
  "https://i.pinimg.com/736x/eb/57/98/eb5798e57bcc4ef1219dbbb75dff80b7.jpg",
  "https://i.pinimg.com/736x/dd/a7/06/dda7060c601658ad4468de037eab4490.jpg",
  "https://i.pinimg.com/736x/6d/d9/bb/6dd9bb256e93cb60b5e7d9af5a4f9f46.jpg",
  "https://i.pinimg.com/736x/8b/a8/ca/8ba8caa12913c1fc1b4cf7a32b110ee3.jpg",
  "https://i.pinimg.com/736x/25/48/18/2548182a7e7409ce203e2a7cb9b084db.jpg",
  "https://i.pinimg.com/736x/94/c9/6f/94c96f0941ba35399d8a5a1e53b105da.jpg",
  "https://i.pinimg.com/736x/15/19/b7/1519b7c0e426f8d185b4207c634988ad.jpg"
];

const productNames = [
  "Ethereal Ceramic Vase", "Woven Aesthetic Runner", "Minimalist Concrete Planter",
  "Handcrafted Clay Mug", "Boho Macrame Wall Art", "Ribbed Terracotta Pot",
  "Abstract Resin Coaster", "Vintage Linen Throw", "Speckled Stoneware Bowl",
  "Geometric Glass Terrarium", "Bamboo Serving Tray", "Artisan Wood Serving Board",
  "Rustic Ceramic Pitcher", "Modern Brass Candlestick", "Textured Cotton Pillow",
  "Glazed Porcelain Teapot"
];

export const products = pinterestImages.map((img, index) => {
  // Generate pseudo-random but consistent prices
  const price = Math.floor(Math.random() * (4500 - 1500 + 1) + 1500); // Between 1500 and 4500 INR
  const soldPrice = Math.floor(price * 0.8); // 80% of price is the cost/sold price internally
  const stock = Math.floor(Math.random() * 50);

  return {
    id: `p_${index + 1}`,
    name: productNames[index],
    category: index % 2 === 0 ? "Ceramics" : "Textiles", // Simple alternating categories
    price: price, // Now in Rupees
    soldPrice: soldPrice,
    stockRemaining: stock,
    image: img,
    description: `A beautiful ${productNames[index].toLowerCase()} designed to elevate your space with timeless aesthetic charm.`
  };
});
