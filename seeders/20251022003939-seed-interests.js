'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  /**
   * Add seed commands here.
   *
   * Example:
   * await queryInterface.bulkInsert('People', [{
   *   name: 'John Doe',
   *   isBetaMember: false
   * }], {});
   */
  await queryInterface.bulkInsert('interests', [
   { label: 'Education', description: 'Supporting access to quality education and academic advancement.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Medical', description: 'Funding for surgeries, treatments, medications, and hospital bills.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Emergency', description: 'Urgent help needed in life-threatening or time-sensitive situations.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Environment', description: 'Preserving the planet through conservation and sustainability efforts.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Community Development', description: 'Improving infrastructure and quality of life in communities.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Arts & Culture', description: 'Promoting creative expression, heritage, and cultural preservation.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Sports', description: 'Support for athletes, sports teams, and recreational activities.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Technology', description: 'Innovative ideas in software, hardware, and scientific breakthroughs.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Religion & Faith', description: 'Support for religious activities, missions, and institutions.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Business & Entrepreneurship', description: 'Seed funding for startups and small businesses.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Infrastructure', description: 'Building or upgrading roads, bridges, water systems, etc.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Legal Aid', description: 'Access to justice, court representation, or legal defense.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Animal Welfare', description: 'Care and rescue for animals and wildlife conservation.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Food Security', description: 'Efforts to combat hunger and provide nutritional support.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Housing & Shelter', description: 'Providing safe accommodation and combating homelessness.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Women Empowerment', description: 'Initiatives supporting women’s rights and opportunities.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Youth Programs', description: 'Training, mentoring, and development for young people.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Disability Support', description: 'Programs that empower and assist people with disabilities.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Scientific Research', description: 'Advancing knowledge through formal investigation and studies.', createdAt: new Date(), updatedAt: new Date() },
   { label: 'Disaster Relief', description: 'Emergency aid after floods, earthquakes, fires, and crises.', createdAt: new Date(), updatedAt: new Date() },
  ]);
 },

 async down(queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
   * await queryInterface.bulkDelete('People', null, {});
   */
  await queryInterface.bulkDelete('interests', null, {});
 },
};
