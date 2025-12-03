'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create interests table
    await queryInterface.createTable('interests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // 2. Create user_interests join table
    await queryInterface.createTable('user_interests', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      interestId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'interests', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // 3. Remove old `interests` column from users table
    await queryInterface.removeColumn('users', 'interests');

    // 4. Seed interests
    await queryInterface.bulkInsert('interests', [
      { label: 'Education', description: 'Supporting access to quality education and academic advancement.' },
      { label: 'Medical', description: 'Funding for surgeries, treatments, medications, and hospital bills.' },
      { label: 'Emergency', description: 'Urgent help needed in life-threatening or time-sensitive situations.' },
      { label: 'Environment', description: 'Preserving the planet through conservation and sustainability efforts.' },
      { label: 'Community Development', description: 'Improving infrastructure and quality of life in communities.' },
      { label: 'Arts & Culture', description: 'Promoting creative expression, heritage, and cultural preservation.' },
      { label: 'Sports', description: 'Support for athletes, sports teams, and recreational activities.' },
      { label: 'Technology', description: 'Innovative ideas in software, hardware, and scientific breakthroughs.' },
      { label: 'Religion & Faith', description: 'Support for religious activities, missions, and institutions.' },
      { label: 'Business & Entrepreneurship', description: 'Seed funding for startups and small businesses.' },
      { label: 'Infrastructure', description: 'Building or upgrading roads, bridges, water systems, etc.' },
      { label: 'Legal Aid', description: 'Access to justice, court representation, or legal defense.' },
      { label: 'Animal Welfare', description: 'Care and rescue for animals and wildlife conservation.' },
      { label: 'Food Security', description: 'Efforts to combat hunger and provide nutritional support.' },
      { label: 'Housing & Shelter', description: 'Providing safe accommodation and combating homelessness.' },
      { label: 'Women Empowerment', description: 'Initiatives supporting women’s rights and opportunities.' },
      { label: 'Youth Programs', description: 'Training, mentoring, and development for young people.' },
      { label: 'Disability Support', description: 'Programs that empower and assist people with disabilities.' },
      { label: 'Scientific Research', description: 'Advancing knowledge through formal investigation and studies.' },
      { label: 'Disaster Relief', description: 'Emergency aid after floods, earthquakes, fires, and crises.' },
    ].map(i => ({ ...i, createdAt: new Date(), updatedAt: new Date() })));
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Add the old `interests` column back to users (as ARRAY for rollback)
    await queryInterface.addColumn('users', 'interests', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    });

    // 2. Drop the join table
    await queryInterface.dropTable('user_interests');

    // 3. Delete seeded data
    await queryInterface.bulkDelete('interests', null, {});

    // 4. Drop interests table
    await queryInterface.dropTable('interests');
  }
};
