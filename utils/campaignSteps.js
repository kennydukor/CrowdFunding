module.exports = [
 {
  key: 'basic_details',
  requiredFields: ['title', 'description', 'countryId', 'categoryId', 'beneficiaryId'],
 },
 {
  key: 'set_goal',
  requiredFields: ['goalAmount', 'currency', 'deadline'],
 },
 {
  key: 'add_media',
  requiredFields: ['media'],
 },
 {
  key: 'add_video',
  requiredFields: ['videoUrl'],
  optional: true,
 },
 {
  key: 'campaign_story',
  requiredFields: ['story'],
 },
];
