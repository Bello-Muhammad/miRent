// import { Test, TestingModule } from '@nestjs/testing';
// import { PropertyService } from './property.service';

// describe('PropertyService', () => {
//   let service: PropertyService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [PropertyService],
//     }).compile();

//     service = module.get<PropertyService>(PropertyService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should create a property', async () => {

//     enum PropertyType {
//       APARTMENT = 'APARTMENT',
//       HOUSE = 'HOUSE',
//     }

//     enum Duration {
//       DAILY = 'DAILY',
//       MONTHLY = 'MONTHLY',
//     }

//     const createPropertyDto = {
//       title: 'Test Property',
//       description: 'This is a test property',
//       type: 'APARTMENT' as PropertyType,
//       amount: 1000,
//       duration: 'MONTHLY' as Duration,
//       address: '123 Test St',
//       city: 'Test City',
//       state: 'Test State',
//       country: 'Test Country'
//     };

//     const files = [
//       {
//         originalname: 'test-image.jpg',
//         buffer: Buffer.from('test image data'),
//         mimetype: 'image/jpeg',
//         size: 12345,
//       } as Express.Multer.File
//     ];

//     const result = await service.create(createPropertyDto, files);
//     expect(result).toHaveProperty('status', 'success');
//     expect(result).toHaveProperty('message', 'Property created successfully');
//   });

// });
