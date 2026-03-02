interface WasteAnalysis {
  wasteType: string;
  priority: 'Low' | 'Medium' | 'High';
  suggestedAction: string;
}

export async function analyzeWaste(
  imageBase64: string,
  description: string = ''
): Promise<WasteAnalysis> {

  // Simple rule-based analysis (No AI API needed)

  const text = description.toLowerCase();

  let wasteType = 'Other';
  let priority: 'Low' | 'Medium' | 'High' = 'Medium';
  let suggestedAction = 'Schedule routine waste collection';

  // Waste Type Detection
  if (text.includes('plastic')) {
    wasteType = 'Plastic';
    suggestedAction = 'Send to plastic recycling unit';
  }
  else if (text.includes('food') || text.includes('organic')) {
    wasteType = 'Organic';
    suggestedAction = 'Send to composting unit';
  }
  else if (text.includes('paper')) {
    wasteType = 'Paper';
    suggestedAction = 'Send to paper recycling';
  }
  else if (text.includes('metal')) {
    wasteType = 'Metal';
    suggestedAction = 'Send to metal recycling';
  }
  else if (text.includes('glass')) {
    wasteType = 'Glass';
    suggestedAction = 'Handle carefully and recycle';
  }

  // Priority Detection
  if (text.includes('overflow') || text.includes('smell') || text.includes('urgent')) {
    priority = 'High';
  }
  else if (text.includes('normal')) {
    priority = 'Low';
  }

  return {
    wasteType,
    priority,
    suggestedAction
  };
}