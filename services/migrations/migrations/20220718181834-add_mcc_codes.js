'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('business_descriptions', 'mcc_code', {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true
        });

        const transaction = await queryInterface.sequelize.transaction();
        const mccCodes = [
            'MCC 0742 Veterinary Services',
            'MCC 0763 Agricultural Cooperatives',
            'MCC 0780 Horticultural and Landscaping Services',
            'MCC 1520 General Contractors-Residential and Commercial',
            'MCC 1711 Air Conditioning, Heating, and Plumbing Contractors',
            'MCC 1731 Electrical Contractors',
            'MCC 1740 Insulation, Masonry, Plastering, Stonework, and Tile Setting Contractors',
            'MCC 1750 Carpentry Contractors ',
            'MCC 1761 Roofing and Siding, Sheet Metal Work Contractors',
            'MCC 1771 Concrete Work Contractors ',
            'MCC 1799 Contractors, Special Trade-not elsewhere classified',
            'MCC 2741 Miscellaneous Publishing and Printing',
            'MCC 2791 Typesetting, Plate Making, and Related Services',
            'MCC 2842 Sanitation, Polishing, and Specialty Cleaning Preparations',
            'MCC 3000 Airlines, Air Carriers',
            'MCC 3351 through 3441-Car Rental Agencies',
            'MCC 3501 through 3999-Lodging-Hotels, Motels, Resorts',
            'MCC 4011 Railroads-Freight',
            'MCC 4112 Passenger Railways',
            'MCC 4119 Ambulance Services',
            'MCC 4131 Bus Lines',
            'MCC 4214 Motor Freight Carriers, Trucking-Local/Long Distance, Moving and Storage Companies',
            'MCC 4215 Courier Services-Air and Ground, Freight Forwarders',
            'MCC 4225 Public Warehousing-Farm Products, Refrigerated Goods, Household Goods Storage',
            'MCC 4411 Cruise Lines',
            'MCC 4457 Boat Leases and Boat Rentals',
            'MCC 4468 Marinas, Marine Service/Supplies',
            'MCC 4511 Air Carriers, Airlines-not elsewhere classified',
            'MCC 4582 Airports, Airport Terminals, Flying Fields',
            'MCC 4722 Travel Agencies and Tour Operators',
            'MCC 4784 Bridge and Road Fees, Tolls',
            'MCC 4789 Transportation Services-not elsewhere classified',
            'MCC 4812 Telecommunication Equipment Including Telephone Sales',
            'MCC 4813 Key-entry Telecom Merchant providing single local and long-distance',
            'MCC 4821 Telegraph Services ',
            'MCC 4829 Money Transfer-Merchant',
            'MCC 4899 Cable, Satellite, and Other Pay Television and Radio Services',
            'MCC 4900 Utilities-Electric, Gas, Heating Oil, Sanitary, Water',
            'MCC 5021 Office and Commercial Furniture',
            'MCC 5039 Construction Materials-not elsewhere classified',
            'MCC 5044 Office, Photographic, Photocopy, and Microfilm Equipment',
            'MCC 5045 Computers, Computer Peripheral Equipment, Software',
            'MCC 5046 Commercial Equipment-not elsewhere classified',
            'MCC 5047 Dental/Laboratory/Medical/Ophthalmic Hospital Equipment and Supplies',
            'MCC 5051 Metal Service Centers and Office',
            'MCC 5072 Hardware Equipment and Supplies',
            'MCC 5085 Industrial Supplies-not elsewhere classified',
            'MCC 5111 Stationery, Office Supplies, Printing and Writing Paper',
            'MCC 5122 Drugs, Drug Proprietors, and Druggists Sundries',
            'MCC 5131 Piece Goods, Notions, and Other Dry Goods',
            'MCC 5137 Men’s, Women’s, and Children’s Uniforms and Commercial Clothing',
            'MCC 5139 Commercial Footwear',
            'MCC 5169 Chemicals and Allied Products-not elsewhere classified',
            'MCC 5251 Hardware Stores',
            'MCC 5261 Lawn and Garden Supply Stores',
            'MCC 5271 Mobile Home Dealers',
            'MCC 5300 Wholesale Club',
            'MCC 5309 Duty Free Stores',
            'MCC 5310 Discount Stores',
            'MCC 5311 Department Stores',
            'MCC 5331 Variety Stores',
            'MCC 5399 Miscellaneous General Merchandise Stores',
            'MCC 5422 Freezer, Locker Meat Provisioners',
            'MCC 5441 Candy, Nut, Confectionery Stores',
            'MCC 5451 Dairy Products Stores',
            'MCC 5462 Bakeries',
            'MCC 5499 Miscellaneous Food Stores-Convenience Stores, Markets, Specialty Store',
            'MCC 5511 Automobile and Truck Dealers-Sales, Service, Repairs, Parts, and Leasing',
            'MCC 5521 Automobile and Truck Dealers-(Used Only)',
            'MCC 5531 Auto Store, Home Supply Stores',
            'MCC 5532 Automotive Tire Stores',
            'MCC 5533 Automotive Parts, Accessories Stores',
            'MCC 5541 Service Stations (with or without Ancillary Services)',
            'MCC 5542 Fuel Dispenser, Automated',
            'MCC 5551 Boat Dealers',
            'MCC 7216 Dry Cleaners ',
            'MCC 7217 Carpet and Upholstery Cleaning ',
            'MCC 7221 Photographic Studios',
            'MCC 7230 Barber and Beauty Shops',
            'MCC 7251 Hat Cleaning Shops, Shoe Repair Shops, Shoe Shine Parlors ',
            'MCC 7261 Funeral Service and Crematories',
            'MCC 7273 Dating and Escort Services',
            'MCC 7276 Tax Preparation Service',
            'MCC 7277 Debt, Marriage, Personal-Counseling Service',
            'MCC 7278 Buying/Shopping Clubs, Services ',
            'MCC 7296 Clothing Rental-Costumes, Uniforms, and Formal Wear',
            'MCC 7297 Massage Parlors',
            'MCC 7298 Health and Beauty Spas',
            'MCC 7311 Advertising Services',
            'MCC 7321 Consumer Credit Reporting Agencies',
            'MCC 7333 Commercial Art, Graphics, Photography',
            'MCC 7338 Quick Copy, Reproduction, and Blueprinting Services',
            'MCC 7339 Stenographic and Secretarial Support Services',
            'MCC 7342 Exterminating and Disinfecting Services',
            'MCC 7349 Cleaning and Maintenance, Janitorial Services',
            'MCC 7361 Employment Agencies, Temporary Help Services',
            'MCC 7372 Computer Programming, Data Processing, and Integrated Systems DesignServices',
            'MCC 7375 Information Retrieval Services',
            'MCC 7379 Computer Maintenance, Repair, and Services-not elsewhere classified',
            'MCC 7392 Consulting, Management, and Public Relations Services',
            'MCC 7393 Detective Agencies, Protective Agencies, Security Services including Armored Cars, Guard Dogs',
            'MCC 7394 Equipment Rental and Leasing Services, Furniture Rental, Tool Rental',
            'MCC 9222 Fines',
            'MCC 9223 Bail and Bond Payments',
            'MCC 9311 Tax Payments',
            'MCC 7542 Car Washes',
            'MCC 7549 Towing Services ',
            'MCC 7622 Electronic Repair Shops',
            'MCC 7623 Air Conditioning and Refrigeration Repair Shops',
            'MCC 7629 Appliance Repair Shops, Electrical and Small',
            'MCC 7631 Clock, Jewelry, and Watch Repair Shops',
            'MCC 7641 Furniture-Reupholstery and Repair, Refinishing',
            'MCC 7692 Welding Repair',
            'MCC 7911 Dance Halls, Schools, and Studios',
            'MCC 7922 Theatrical Producers (except Motion Pictures), Ticket Agencies',
            'MCC 7929 Bands, Orchestras, and Miscellaneous Entertainers-not elsewhere',
            'MCC 7932 Pool and Billiard Establishments',
            'MCC 7933 Bowling Alleys',
            'MCC 7941 Athletic Fields, Commercial Sports, Professional Sports Clubs, Sports Promoters',
            'MCC 7991 Tourist Attractions and Exhibits',
            'MCC 7992 Golf Courses, Public',
            'MCC 7993 Video Amusement Game Supplies',
            'MCC 7994 Video Game Arcades/Establishments',
            'MCC 7996 Amusement Parks, Carnivals, Circuses, Fortune Tellers',
            'MCC 7997 Clubs-Country Clubs, Membership (Athletic, Recreation, Sports), Private',
            'MCC 7998 Aquariums, Dolphinariums, Zoos, and Seaquariums',
            'MCC 7999 Recreation Services-not elsewhere classified',
            'MCC 8031 Osteopathic Physicians',
            'MCC 8021 Dentists, Orthodontists',
            'MCC 8042 Optometrists, Ophthalmologists',
            'MCC 8043 Opticians, Optical Goods, and Eyeglasses',
            'MCC 8049 Chiropodists, Podiatrists',
            'MCC 8050 Nursing and Personal Care Facilities',
            'MCC 8062 Hospitals',
            'MCC 8071 Dental and Medical Laboratories',
            'MCC 8099 Health Practitioners, Medical Services-not elsewhere classified',
            'MCC 8111 Attorneys, Legal Services',
            'MCC 8211 Schools, Elementary and Secondary',
            'MCC 8220 Colleges, Universities, Professional Schools, and Junior Colleges',
            'MCC 8241 Schools, Correspondence',
            'MCC 8244 Schools, Business and Secretarial',
            'MCC 8249 Schools, Trade and Vocational',
            'MCC 8299 Schools and Educational Services-not elsewhere classified',
            'MCC 8351 Child Care Services',
            'MCC 8398 Organizations, Charitable and Social Service',
            'MCC 8641 Associations-Civic, Social, and Fraternal',
            'MCC 8651 Organizations, Political',
            'MCC 8661 Organizations, Religious',
            'MCC 8675 Automobile Associations',
            'MCC 8699 Organizations, Membership',
            'MCC 8734 Testing Laboratories (Non–Medical)',
            'MCC 8911 Architectural, Engineering, and Surveying Services',
            'MCC 8931 Accounting, Auditing, and Bookkeeping Services',
            'MCC 8999 Professional Services-not elsewhere classified',
            'MCC 9211 Court Costs including Alimony and Child Support ',
            'MCC 9399 Government Services-not elsewhere classified',
            'MCC 9402 Postal Services-Government Only',
            'MCC 9405 Intra-Government Purchases-Government Only',
            'MCC 9751 U.K. Supermarkets',
            'MCC 9752 U.K. Petrol Stations',
            'MCC 9754 Gambling-Horse Racing'
        ];

        const getbusinessDescriptionInsertQuery = () => {
            let allQuery = [];
            const query = `INSERT INTO business_descriptions VALUES `;
            mccCodes.forEach((codes) => {
                allQuery.push(`(DEFAULT,"${codes}",NOW(), NOW(), "${codes.split(' ')[1]}")`);
            });

            let queryPart2 = '';
            allQuery.forEach((query, index) => {
                queryPart2 = `${queryPart2}${query}`;
                if (index !== mccCodes.length - 1) {
                    queryPart2 = `${queryPart2},\n`;
                }
            });
            return `${query}${queryPart2}`;
        };

        try {
            await queryInterface.sequelize.query(`LOCK TABLES business_descriptions WRITE;`, { raw: true });
            await queryInterface.sequelize.query(getbusinessDescriptionInsertQuery(), { raw: true });
            await queryInterface.sequelize.query(`UNLOCK TABLES;`, { raw: true });
        } catch (error) {
            console.log(error);
            await transaction.rollback();
        }
    },

    async down(queryInterface, Sequelize) {}
};
