// Plant and non-plant detection database with ML-like features
export interface DetectableItem {
  id: string
  name: string
  category: "plant" | "non-plant"
  description: string
  characteristics: string[]
  image?: string
  confidence: number
}

export const PLANTS: DetectableItem[] = [
  {
    id: "rose",
    name: "Rose",
    category: "plant",
    description: "A flowering plant with thorny stems and colorful petals",
    characteristics: ["petals", "thorns", "green stem", "flowers", "organic texture"],
    confidence: 0.92,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    category: "plant",
    description: "A tall plant with large yellow flower head and green leaves",
    characteristics: ["yellow petals", "large flower", "green stem", "leaves", "natural pattern"],
    confidence: 0.88,
  },
  {
    id: "tulip",
    name: "Tulip",
    category: "plant",
    description: "A spring-flowering plant with cup-shaped colorful flowers",
    characteristics: ["cup-shaped", "colorful petals", "smooth stem", "green leaves", "symmetrical"],
    confidence: 0.85,
  },
  {
    id: "fern",
    name: "Fern",
    category: "plant",
    description: "A leafy plant with feathery, delicate fronds",
    characteristics: ["feathery leaves", "green fronds", "organic pattern", "delicate", "natural texture"],
    confidence: 0.9,
  },
  {
    id: "lavender",
    name: "Lavender",
    category: "plant",
    description: "A fragrant plant with purple flower spikes and narrow leaves",
    characteristics: ["purple flowers", "spike pattern", "narrow leaves", "fragrant", "organic growth"],
    confidence: 0.89,
  },
]

export const NON_PLANTS: DetectableItem[] = [
  {
    id: "rock",
    name: "Rock",
    category: "non-plant",
    description: "A natural stone or mineral formation",
    characteristics: ["hard surface", "gray/brown color", "rough texture", "no organic features", "mineral"],
    confidence: 0.94,
  },
  {
    id: "metal-can",
    name: "Metal Can",
    category: "non-plant",
    description: "An aluminum or steel beverage container",
    characteristics: ["metallic", "cylindrical", "smooth surface", "reflective", "manufactured"],
    confidence: 0.96,
  },
  {
    id: "plastic-bottle",
    name: "Plastic Bottle",
    category: "non-plant",
    description: "A plastic container for liquids",
    characteristics: ["transparent/translucent", "smooth plastic", "cylindrical", "manufactured", "synthetic"],
    confidence: 0.93,
  },
  {
    id: "wood-block",
    name: "Wood Block",
    category: "non-plant",
    description: "A cut piece of wood or wooden cube",
    characteristics: ["wood grain", "rectangular", "hard surface", "brown/tan color", "processed"],
    confidence: 0.91,
  },
  {
    id: "ceramic-pot",
    name: "Ceramic Pot",
    category: "non-plant",
    description: "A clay or ceramic container",
    characteristics: ["ceramic texture", "rounded shape", "porous surface", "manufactured", "earthy color"],
    confidence: 0.92,
  },
]

export const ALL_ITEMS = [...PLANTS, ...NON_PLANTS]

// ML-like detection function that analyzes image characteristics
export function detectItem(imageCharacteristics: string[]): DetectableItem {
  // Score each item based on matching characteristics
  const scores = ALL_ITEMS.map((item) => {
    const matchingCharacteristics = item.characteristics.filter((char) =>
      imageCharacteristics.some((imgChar) => imgChar.toLowerCase().includes(char.toLowerCase())),
    )
    return {
      item,
      score: (matchingCharacteristics.length / item.characteristics.length) * item.confidence,
    }
  })

  // Sort by score and return the best match
  scores.sort((a, b) => b.score - a.score)

  // If no good match, randomly select (simulating ML uncertainty)
  if (scores[0].score < 0.3) {
    return ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)]
  }

  return scores[0].item
}

// Simulate image analysis to extract characteristics
export function analyzeImageCharacteristics(): string[] {
  const allCharacteristics = ALL_ITEMS.flatMap((item) => item.characteristics)
  const uniqueCharacteristics = Array.from(new Set(allCharacteristics))

  // Randomly select 3-5 characteristics to simulate image analysis
  const selectedCount = Math.floor(Math.random() * 3) + 3
  const selected: string[] = []

  for (let i = 0; i < selectedCount; i++) {
    const randomChar = uniqueCharacteristics[Math.floor(Math.random() * uniqueCharacteristics.length)]
    if (!selected.includes(randomChar)) {
      selected.push(randomChar)
    }
  }

  return selected
}
