// src/services/resourcesProvider.js
const MOCK = [
  { id: 1, title: 'Python for Everybody', platform: 'Coursera', category: 'cs', level: 'beginner', url: '#' },
  { id: 2, title: 'The Web Developer Bootcamp', platform: 'Udemy', category: 'cs', level: 'beginner', url: '#' },
  { id: 3, title: 'Introduction to Corporate Finance', platform: 'edX', category: 'legal', level: 'intermediate', url: '#' },
  { id: 4, title: 'Anatomy: Musculoskeletal and Integumentary Systems', platform: 'Coursera', category: 'health', level: 'advanced', url: '#' },
  { id: 5, title: 'React - The Complete Guide', platform: 'Udemy', category: 'cs', level: 'intermediate', url: '#' },
  { id: 6, title: "CS50's Introduction to Computer Science", platform: 'edX', category: 'cs', level: 'beginner', url: '#' },
  { id: 7, title: 'Sports Nutrition and Performance', platform: 'Udemy', category: 'sports', level: 'intermediate', url: '#' },
  { id: 8, title: 'Contract Law: From Trust to Promise to Contract', platform: 'edX', category: 'legal', level: 'beginner', url: '#' },
];

export async function getCourses({ search='', category='all', level='all' }={}){
  await new Promise(r=> setTimeout(r, 200)); // simulate latency
  const q = search.trim().toLowerCase();
  return MOCK.filter(c=>{
    const matchesSearch = !q || c.title.toLowerCase().includes(q);
    const matchesCat = category==='all' || c.category===category;
    const matchesLvl = level==='all' || c.level===level;
    return matchesSearch && matchesCat && matchesLvl;
  });
}
