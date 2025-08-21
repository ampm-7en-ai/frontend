// Function to analyze sentiment for a conversation
export function analyzeSentiment(scores) {
  // Handle edge case: empty conversation
  if (!scores || scores.length === 0) {
    return {
      weightedAverage: 5, // Neutral default for 0 messages
      sentimentCategory: 'Neutral',
      movingAverages: [],
      trend: 'No interaction'
    };
  }

  // Primary Metric: Weighted Average (last message has 2x weight)
  const weights = new Array(scores.length).fill(1);
  weights[scores.length - 1] = 3; // 3x weight for last message
  const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const weightedAverage = Math.round(weightedSum / totalWeight);

  // Determine sentiment category
  let sentimentCategory;
  if (weightedAverage <= 2) {
    sentimentCategory = 'Frustrated';
  } else if (weightedAverage <= 6) {
    sentimentCategory = 'Neutral';
  } else {
    sentimentCategory = 'Satisfied';
  }

  // Trend Analysis: Moving Average (3-message window)
  const windowSize = 3;
  const movingAverages = [];
  for (let i = 0; i <= scores.length - windowSize; i++) {
    const window = scores.slice(i, i + windowSize);
    const avg = window.reduce((sum, score) => sum + score, 0) / windowSize;
    movingAverages.push(Number(avg.toFixed(2))); // Round to 2 decimals
  }

  // Determine trend direction (based on moving averages)
  let trend = 'Stable';
  if (movingAverages.length > 1) {
    const firstAvg = movingAverages[0];
    const lastAvg = movingAverages[movingAverages.length - 1];
    if (lastAvg > firstAvg + 1) {
      trend = 'Improving';
    } else if (lastAvg < firstAvg - 1) {
      trend = 'Deteriorating';
    }
  }

  return {
    weightedAverage: Number(weightedAverage.toFixed(2)),
    sentimentCategory,
    movingAverages,
    trend
  };
}