/**
 * Converts a string into a URL-friendly slug.
 * Example: "Apex Physics & Math Academy!" -> "apex-physics-math-academy"
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generates a unique institute slug in the database.
 * If slug collisions occur, appends an incrementing numeric suffix (-1, -2, etc.)
 */
export async function generateUniqueSlug(db, name, currentInstituteId = null) {
  let baseSlug = slugify(name);
  if (!baseSlug) {
    baseSlug = 'coaching';
  }

  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = 'SELECT id FROM institutes WHERE slug = ?';
    let params = [candidateSlug];

    if (currentInstituteId) {
      query += ' AND id != ?';
      params.push(currentInstituteId);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
