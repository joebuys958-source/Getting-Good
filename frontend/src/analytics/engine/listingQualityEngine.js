export function runListingQualityEngine(items = []) {
  return items.map(i => {
    let score = 60;
    const issues = [];
    const improvements = [];

    if (i.name?.length > 20) score += 10;
    else {
      issues.push("Short title");
      improvements.push("Add more descriptive keywords to the title");
    }

    if (i.description?.length > 80) score += 10;
    else {
      issues.push("Thin description");
      improvements.push("Expand description with fit, condition, and style details");
    }

    if (i.brand) score += 10;
    else {
      issues.push("No brand");
      improvements.push("Add brand if applicable — improves search ranking");
    }

    if (i.photos?.length >= 3) score += 10;
    else {
      issues.push("Few photos");
      improvements.push("Upload at least 3 clear photos (front, back, detail)");
    }

    // NEW: condition awareness
    if (i.condition === "New" || i.condition === "Like New") score += 5;

    const finalScore = Math.min(100, score);

    return {
      id: i.id,
      name: i.name,
      score: finalScore,
      issues,
      improvements,
      summary:
        finalScore >= 85
          ? "Strong listing — no changes needed"
          : "Listing can be improved for better visibility",
    };
  });
}
