// import { Test, TestingModule } from '@nestjs/testing';
// import { PropertyController } from './property.controller';
// import { PropertyService } from './property.service';
// import { PrismaService } from 'src/prisma/prisma.service';

// describe('PropertyController', () => {
//   let controller: PropertyController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [PropertyController],
//       providers: [PropertyService, PrismaService],
//     }).compile();

//     controller = module.get<PropertyController>(PropertyController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   it('should create a property', async () => {
//     const createPropertyDto = {
//       title: 'Test Property',
//       description: 'This is a test property',
//       type: 'APARTMENT',
//       amount: 1000,
//       duration: 'MONTHLY',
//       address: '123 Test St',
//       city: 'Test City',
//       state: 'Test State',
//       country: 'Test Country'
//     };

//     const files = { images: [
//       {
//         originalname: 'test-image.jpg',
//         buffer: Buffer.from('test image data'),
//         mimetype: 'image/jpeg',
//         size: 12345,
//       } as Express.Multer.File
//     ]};

//     const result = await controller.create(createPropertyDto, files);
//     expect(result).toHaveProperty('status', 'success');
//     expect(result).toHaveProperty('message', 'Property created successfully');
//   });

// });
