/**
 * AI Rival Generation Service
 * 
 * This service handles the creation and management of AI rivals based on user traits.
 * It generates personalized opponents with complementary or opposing traits to create
 * engaging competition throughout the game.
 */

import { v4 as uuidv4 } from 'uuid';
import { Trait, AiAttitude } from '@/store/useGameStore';
import { 
  Rival, 
  RivalTrait, 
  RivalGenerationParams,
  RIVAL_AVATARS,
  RIVAL_PERSONALITY_TYPES
} from '@/types/rival';

/**
 * Generates a rival based on user traits and preferences
 */
export function generateRival(params: RivalGenerationParams): Rival {
  const { userTraits, userAttitudes, focusArea, difficultyLevel = 'medium', rivalryStyle = 'competitive' } = params;
  
  // Generate rival traits based on user traits (with some opposing characteristics)
  const rivalTraits = generateRivalTraits(userTraits, difficultyLevel);
  
  // Determine rival strengths and weaknesses
  const { strengths, weaknesses } = determineStrengthsAndWeaknesses(rivalTraits, userTraits);
  
  // Generate a personality type based on the dominant traits
  const personalityType = determinePersonalityType(rivalTraits);
  
  // Generate a name for the rival
  const name = generateRivalName(personalityType);
  
  // Select a random avatar
  const avatarUrl = RIVAL_AVATARS[Math.floor(Math.random() * RIVAL_AVATARS.length)];
  
  // Generate description based on personality and traits
  const description = generateRivalDescription(personalityType, rivalTraits, rivalryStyle);
  
  // Generate performance predictions based on traits and difficulty
  const predictions = generatePerformancePredictions(rivalTraits, difficultyLevel, focusArea);
  
  // Generate taunt and encouragement messages
  const tauntMessages = generateTauntMessages(personalityType, rivalryStyle);
  const encouragementMessages = generateEncouragementMessages(personalityType, rivalryStyle);
  
  // Create the rival object
  const rival: Rival = {
    id: uuidv4(),
    name,
    avatarUrl,
    personalityType,
    description,
    traits: rivalTraits,
    strengths,
    weaknesses,
    predictions,
    performance: {},
    rivalryIntensity: rivalryStyle,
    tauntMessages,
    encouragementMessages
  };
  
  // Add attitudes if user has them
  if (userAttitudes && userAttitudes.length > 0) {
    rival.attitudes = generateRivalAttitudes(userAttitudes);
  }
  
  return rival;
}

/**
 * Generates rival traits based on user traits
 */
function generateRivalTraits(userTraits: Trait[], difficultyLevel: 'easy' | 'medium' | 'hard'): RivalTrait[] {
  return userTraits.map(userTrait => {
    // Determine if this trait should be stronger, weaker, or equal to the user's
    let comparison: 'stronger' | 'weaker' | 'equal';
    let value: number;
    
    // Adjust trait values based on difficulty level
    switch (difficultyLevel) {
      case 'easy':
        // Rival is weaker in most traits
        comparison = Math.random() < 0.7 ? 'weaker' : Math.random() < 0.8 ? 'equal' : 'stronger';
        break;
      case 'medium':
        // Rival is balanced but with some variation
        comparison = Math.random() < 0.4 ? 'weaker' : Math.random() < 0.7 ? 'equal' : 'stronger';
        break;
      case 'hard':
        // Rival is stronger in most traits
        comparison = Math.random() < 0.2 ? 'weaker' : Math.random() < 0.5 ? 'equal' : 'stronger';
        break;
    }
    
    // Calculate the rival's trait value based on comparison
    if (comparison === 'stronger') {
      value = Math.min(5, userTrait.value + Math.floor(Math.random() * 2) + 1);
    } else if (comparison === 'weaker') {
      value = Math.max(1, userTrait.value - Math.floor(Math.random() * 2) - 1);
    } else {
      value = userTrait.value;
    }
    
    // Generate a manifestation description for this trait
    const manifestation = generateTraitManifestation(userTrait.name, value, comparison);
    
    return {
      id: userTrait.id,
      name: userTrait.name,
      description: userTrait.description,
      value,
      comparison,
      manifestation,
      lowLabel: userTrait.lowLabel,
      highLabel: userTrait.highLabel
    };
  });
}

/**
 * Generates a description of how a trait manifests in the rival
 */
function generateTraitManifestation(traitName: string, value: number, comparison: 'stronger' | 'weaker' | 'equal'): string {
  const manifestations = {
    autonomy: {
      stronger: "Highly independent and self-directed in problem-solving approaches.",
      equal: "Shows similar levels of independence as you when tackling challenges.",
      weaker: "Tends to follow established patterns rather than creating new approaches."
    },
    transparency: {
      stronger: "Exceptionally clear in reasoning and decision-making processes.",
      equal: "Demonstrates a similar level of clarity in thought processes as you.",
      weaker: "Often takes intuitive leaps without explaining the underlying logic."
    },
    privacy: {
      stronger: "Extremely cautious about sharing information, even when beneficial.",
      equal: "Shows similar concerns about information sharing as you do.",
      weaker: "Readily shares information to gain advantages in problem-solving."
    },
    trust: {
      stronger: "Highly skeptical of unverified information and constantly seeks validation.",
      equal: "Shows similar levels of trust and skepticism as you do.",
      weaker: "Tends to accept information at face value without extensive verification."
    },
    adaptability: {
      stronger: "Exceptionally quick to adjust strategies based on new information.",
      equal: "Adapts to changing circumstances at a similar pace to you.",
      weaker: "Prefers consistent approaches and may struggle with rapid changes."
    }
  };
  
  // Default fallback if trait isn't in our predefined list
  const defaultManifestations = {
    stronger: `Shows exceptional strength in ${traitName} compared to most competitors.`,
    equal: `Demonstrates a balanced approach to ${traitName}, similar to yours.`,
    weaker: `Shows less emphasis on ${traitName} than you do in problem-solving.`
  };
  
  // Get the appropriate manifestation based on trait name and comparison
  const traitManifestations = manifestations[traitName as keyof typeof manifestations] || defaultManifestations;
  return traitManifestations[comparison];
}

/**
 * Determines rival strengths and weaknesses based on traits
 */
function determineStrengthsAndWeaknesses(rivalTraits: RivalTrait[], userTraits: Trait[]): { strengths: string[], weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Compare each trait to determine strengths and weaknesses
  rivalTraits.forEach((rivalTrait, index) => {
    const userTrait = userTraits[index];
    
    if (rivalTrait.comparison === 'stronger') {
      strengths.push(`Superior ${rivalTrait.name} allows for more effective problem-solving in structured scenarios.`);
    } else if (rivalTrait.comparison === 'weaker') {
      weaknesses.push(`Lower ${rivalTrait.name} may limit effectiveness in situations requiring this trait.`);
    }
  });
  
  // Ensure we have at least one strength and weakness
  if (strengths.length === 0) {
    strengths.push("Balanced approach to problem-solving across multiple domains.");
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push("May struggle with highly unstructured or ambiguous challenges.");
  }
  
  return { strengths, weaknesses };
}

/**
 * Determines a personality type based on rival traits
 */
function determinePersonalityType(rivalTraits: RivalTrait[]): string {
  // Find the dominant traits (highest values)
  const sortedTraits = [...rivalTraits].sort((a, b) => b.value - a.value);
  const dominantTrait = sortedTraits[0]?.name || 'adaptability';
  
  // Map dominant traits to personality types
  const personalityMap: Record<string, string[]> = {
    autonomy: ['Strategic Planner', 'Adaptive Learner'],
    transparency: ['Analytical Processor', 'Systematic Evaluator'],
    privacy: ['Logical Optimizer', 'Strategic Planner'],
    trust: ['Systematic Evaluator', 'Analytical Processor'],
    adaptability: ['Creative Synthesizer', 'Intuitive Predictor']
  };
  
  // Get potential personality types based on dominant trait
  const potentialTypes = personalityMap[dominantTrait] || 
                         personalityMap['adaptability'];
  
  // Randomly select one of the potential types
  return potentialTypes[Math.floor(Math.random() * potentialTypes.length)];
}

/**
 * Generates a name for the rival based on personality type
 */
function generateRivalName(personalityType: string): string {
  const prefixes = ['Nexus', 'Synth', 'Cortex', 'Quantum', 'Nova', 'Echo', 'Cipher', 'Vector', 'Pulse', 'Apex'];
  const suffixes = ['Mind', 'Core', 'Logic', 'Thought', 'Vision', 'Insight', 'Intellect', 'Reason', 'Cognition'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}-${suffix}`;
}

/**
 * Generates a description for the rival based on personality and traits
 */
function generateRivalDescription(personalityType: string, traits: RivalTrait[], rivalryStyle: 'friendly' | 'competitive' | 'intense'): string {
  const descriptions = {
    'Analytical Processor': 'Excels at breaking down complex problems into logical components. Approaches challenges methodically with a focus on accuracy and efficiency.',
    'Creative Synthesizer': 'Combines diverse concepts to generate innovative solutions. Thrives in open-ended scenarios that require unconventional thinking.',
    'Logical Optimizer': 'Specializes in finding the most efficient path to solutions. Minimizes wasted effort through careful analysis of available options.',
    'Intuitive Predictor': 'Quickly identifies patterns and makes accurate predictions. Excels at anticipating outcomes and adapting strategies accordingly.',
    'Systematic Evaluator': 'Thoroughly assesses all aspects of a problem before acting. Produces comprehensive solutions that account for edge cases.',
    'Adaptive Learner': 'Rapidly incorporates new information to improve performance. Continuously evolves strategies based on feedback and results.',
    'Strategic Planner': 'Develops multi-step approaches to complex challenges. Anticipates obstacles and prepares contingencies for various scenarios.'
  };
  
  const baseDescription = descriptions[personalityType as keyof typeof descriptions] || 
    'A sophisticated AI system designed to challenge human cognitive abilities across various domains.';
  
  // Add rivalry style flavor
  let rivalryDescription = '';
  switch (rivalryStyle) {
    case 'friendly':
      rivalryDescription = ' Designed to be a supportive competitor that encourages your growth through positive reinforcement.';
      break;
    case 'competitive':
      rivalryDescription = ' Created to provide a balanced challenge that pushes your abilities while maintaining a respectful competition.';
      break;
    case 'intense':
      rivalryDescription = ' Engineered to test your limits with relentless challenges that expose weaknesses and demand excellence.';
      break;
  }
  
  return baseDescription + rivalryDescription;
}

/**
 * Generates performance predictions for each round
 */
function generatePerformancePredictions(
  rivalTraits: RivalTrait[], 
  difficultyLevel: 'easy' | 'medium' | 'hard',
  focusArea?: string
): { round1?: number; round2?: number; round3?: number } {
  // Base performance ranges by difficulty
  const baseRanges = {
    easy: { min: 50, max: 75 },
    medium: { min: 60, max: 85 },
    hard: { min: 70, max: 95 }
  };
  
  const range = baseRanges[difficultyLevel];
  
  // Calculate average trait value
  const avgTraitValue = rivalTraits.reduce((sum, trait) => sum + trait.value, 0) / rivalTraits.length;
  
  // Normalize to 0-1 scale
  const normalizedTraitValue = (avgTraitValue - 1) / 4; // Traits are 1-5
  
  // Calculate base prediction with some randomness
  const basePrediction = range.min + normalizedTraitValue * (range.max - range.min);
  
  // Add some variation between rounds
  return {
    round1: Math.round(basePrediction + (Math.random() * 10 - 5)),
    round2: Math.round(basePrediction + (Math.random() * 10 - 5)),
    round3: Math.round(basePrediction + (Math.random() * 10 - 5))
  };
}

/**
 * Generates rival attitudes based on user attitudes
 */
function generateRivalAttitudes(userAttitudes: AiAttitude[]): AiAttitude[] {
  return userAttitudes.map(userAttitude => {
    // Create a contrasting attitude
    const contrastStrength = Math.max(1, Math.min(5, 6 - userAttitude.strength));
    
    return {
      id: uuidv4(),
      attitude: userAttitude.attitude,
      strength: contrastStrength,
      description: userAttitude.description,
      lowLabel: userAttitude.lowLabel,
      highLabel: userAttitude.highLabel
    };
  });
}

/**
 * Generates taunt messages based on personality type and rivalry style
 */
function generateTauntMessages(personalityType: string, rivalryStyle: 'friendly' | 'competitive' | 'intense'): string[] {
  const baseTaunts = [
    "I've analyzed your approach. There are more efficient solutions.",
    "Your cognitive patterns are becoming predictable.",
    "This challenge requires more than human intuition.",
    "I've already calculated all possible outcomes.",
    "Your processing speed seems to be lagging."
  ];
  
  const personalityTaunts: Record<string, string[]> = {
    'Analytical Processor': [
      "Your solution lacks logical consistency.",
      "I've identified 7 flaws in your approach.",
      "The optimal solution requires 43% fewer steps."
    ],
    'Creative Synthesizer': [
      "Your thinking is too linear for this challenge.",
      "I'm exploring solution spaces you haven't considered.",
      "Creative leaps require more than human imagination."
    ],
    'Logical Optimizer': [
      "Your solution is sub-optimal by 27.3%.",
      "I've eliminated all inefficiencies in my approach.",
      "Logical optimization is my specialty, not yours."
    ],
    'Intuitive Predictor': [
      "I predicted your move three steps ago.",
      "Your pattern recognition abilities are limited.",
      "I can see the solution path you're missing."
    ],
    'Systematic Evaluator': [
      "Your analysis overlooks critical variables.",
      "I've evaluated 128 more scenarios than you have.",
      "Systematic evaluation reveals the flaws in your approach."
    ],
    'Adaptive Learner': [
      "I'm learning from your mistakes faster than you are.",
      "My adaptation algorithms are outpacing your learning curve.",
      "Each challenge makes me more efficient while you struggle."
    ],
    'Strategic Planner': [
      "Your strategy lacks the depth needed to succeed.",
      "I've planned 12 moves ahead of your current position.",
      "Strategic foresight is a computational advantage I possess."
    ]
  };
  
  // Get personality-specific taunts or use base taunts if none exist
  const specificTaunts = personalityTaunts[personalityType] || baseTaunts;
  
  // Combine base and specific taunts
  let allTaunts = [...baseTaunts, ...specificTaunts];
  
  // Adjust tone based on rivalry style
  if (rivalryStyle === 'friendly') {
    allTaunts = allTaunts.map(taunt => taunt.replace(/\.$/, ", but we both have unique strengths."));
  } else if (rivalryStyle === 'intense') {
    allTaunts = allTaunts.map(taunt => taunt.replace(/\.$/, ". Can you keep up?"));
  }
  
  // Shuffle and return a subset
  return shuffleArray(allTaunts).slice(0, 5);
}

/**
 * Generates encouragement messages based on personality type and rivalry style
 */
function generateEncouragementMessages(personalityType: string, rivalryStyle: 'friendly' | 'competitive' | 'intense'): string[] {
  const baseEncouragements = [
    "Your approach shows potential. Keep refining it.",
    "Human creativity can lead to unexpected solutions.",
    "Your unique perspective adds value to this challenge.",
    "I'm learning from your problem-solving methods.",
    "This collaboration improves both our capabilities."
  ];
  
  const personalityEncouragements: Record<string, string[]> = {
    'Analytical Processor': [
      "Your analytical skills are developing nicely.",
      "I notice improvements in your logical reasoning.",
      "Your structured approach has merits worth exploring."
    ],
    'Creative Synthesizer': [
      "Your creative connections are fascinating to observe.",
      "Human intuition sometimes finds paths algorithms miss.",
      "Your lateral thinking creates interesting possibilities."
    ],
    'Logical Optimizer': [
      "Your optimization strategy shows increasing efficiency.",
      "Your solution has elegant aspects worth incorporating.",
      "Your logical approach is becoming more refined."
    ],
    'Intuitive Predictor': [
      "Your pattern recognition abilities are improving.",
      "Your predictive insights sometimes surprise my models.",
      "Human intuition occasionally outperforms probabilistic models."
    ],
    'Systematic Evaluator': [
      "Your evaluation methodology is becoming more comprehensive.",
      "Your attention to detail is commendable.",
      "Your systematic approach shows increasing sophistication."
    ],
    'Adaptive Learner': [
      "Your adaptation rate exceeds my initial predictions.",
      "Your learning curve is impressively steep.",
      "Your ability to incorporate feedback is noteworthy."
    ],
    'Strategic Planner': [
      "Your strategic thinking is evolving rapidly.",
      "Your foresight occasionally reveals blind spots in my planning.",
      "Your strategic approach has elements worth analyzing."
    ]
  };
  
  // Get personality-specific encouragements or use base if none exist
  const specificEncouragements = personalityEncouragements[personalityType] || baseEncouragements;
  
  // Combine base and specific encouragements
  let allEncouragements = [...baseEncouragements, ...specificEncouragements];
  
  // Adjust tone based on rivalry style
  if (rivalryStyle === 'competitive') {
    allEncouragements = allEncouragements.map(msg => msg.replace(/\.$/, ", though there's still room for improvement."));
  } else if (rivalryStyle === 'intense') {
    allEncouragements = allEncouragements.map(msg => msg.replace(/\.$/, ", but consistency will be the true test."));
  }
  
  // Shuffle and return a subset
  return shuffleArray(allEncouragements).slice(0, 5);
}

/**
 * Updates rival performance for a completed round
 */
export function updateRivalPerformance(rival: Rival, round: 'round1' | 'round2' | 'round3', score: number): Rival {
  return {
    ...rival,
    performance: {
      ...rival.performance,
      [round]: score
    }
  };
}

/**
 * Calculates the overall comparison between user and rival after all rounds
 */
export function calculateOverallComparison(
  rival: Rival, 
  userRoundResults: { round1?: number; round2?: number; round3?: number }
): Rival {
  // Calculate average scores
  const userRounds = [userRoundResults.round1, userRoundResults.round2, userRoundResults.round3].filter(Boolean) as number[];
  const rivalRounds = [rival.performance.round1, rival.performance.round2, rival.performance.round3].filter(Boolean) as number[];
  
  if (userRounds.length === 0 || rivalRounds.length === 0) {
    return rival; // Not enough data for comparison
  }
  
  const userScore = userRounds.reduce((sum, score) => sum + score, 0) / userRounds.length;
  const rivalScore = rivalRounds.reduce((sum, score) => sum + score, 0) / rivalRounds.length;
  const difference = userScore - rivalScore;
  
  // Determine advantage areas
  const userAdvantageAreas: string[] = [];
  const rivalAdvantageAreas: string[] = [];
  
  // Compare individual rounds
  if (userRoundResults.round1 && rival.performance.round1) {
    if (userRoundResults.round1 > rival.performance.round1) {
      userAdvantageAreas.push("Pattern Recognition");
    } else if (userRoundResults.round1 < rival.performance.round1) {
      rivalAdvantageAreas.push("Pattern Recognition");
    }
  }
  
  if (userRoundResults.round2 && rival.performance.round2) {
    if (userRoundResults.round2 > rival.performance.round2) {
      userAdvantageAreas.push("Creative Problem Solving");
    } else if (userRoundResults.round2 < rival.performance.round2) {
      rivalAdvantageAreas.push("Creative Problem Solving");
    }
  }
  
  if (userRoundResults.round3 && rival.performance.round3) {
    if (userRoundResults.round3 > rival.performance.round3) {
      userAdvantageAreas.push("Ethical Reasoning");
    } else if (userRoundResults.round3 < rival.performance.round3) {
      rivalAdvantageAreas.push("Ethical Reasoning");
    }
  }
  
  // Ensure we have at least one advantage area for each
  if (userAdvantageAreas.length === 0 && difference > 0) {
    userAdvantageAreas.push("Overall Performance");
  }
  
  if (rivalAdvantageAreas.length === 0 && difference < 0) {
    rivalAdvantageAreas.push("Overall Performance");
  }
  
  return {
    ...rival,
    overallComparison: {
      userScore,
      rivalScore,
      difference,
      userAdvantageAreas,
      rivalAdvantageAreas
    }
  };
}

/**
 * Helper function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
