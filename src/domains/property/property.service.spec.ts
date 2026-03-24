import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../helper/cloudinary.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { PropertyType, Duration, PropertyStatus } from 'src/generated/prisma/enums';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PropertyService', () => {
    let service: PropertyService;
    let prismaService: jest.Mocked<PrismaService>;
    let cloudinaryService: jest.Mocked<CloudinaryService>;

    const mockPrismaService = {
        property: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        image: {
            createMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    const mockCloudinaryService = {
        uploadMultipleImages: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PropertyService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: CloudinaryService,
                    useValue: mockCloudinaryService,
                },
            ],
        }).compile();

        service = module.get<PropertyService>(PropertyService);
        prismaService = module.get(PrismaService);
        cloudinaryService = module.get(CloudinaryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a property successfully', async () => {
            const createPropertyDto: CreatePropertyDto = {
                title: 'Test Property',
                description: 'Test Description',
                type: PropertyType.FLAT,
                amount: 1000,
                duration: Duration.MONTHLY,
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country',
                area: '500 sqm',
            };

            const files: Express.Multer.File[] = [
                {
                    originalname: 'test.jpg',
                    buffer: Buffer.from('test'),
                    mimetype: 'image/jpeg',
                    size: 1000,
                } as Express.Multer.File,
            ];

            const mockProperty = { id: '1', ...createPropertyDto, ownerId: 'user1' };
            const mockUploadResults = [{ url: 'http://image.com/1', publicId: 'pub1', resourceType: 'image', propertyId: '1' }];

            mockPrismaService.$transaction.mockImplementation(async (callback) => {
                const result = await callback(mockPrismaService);
                return result;
            });

            mockPrismaService.property.create.mockResolvedValue(mockProperty);
            mockCloudinaryService.uploadMultipleImages.mockResolvedValue(mockUploadResults);
            mockPrismaService.image.createMany.mockResolvedValue({ count: 1 });

            const result = await service.create('user1', createPropertyDto, files);

            expect(result).toEqual({
                status: 'success',
                message: 'Property created successfully',
                data: mockProperty,
            });
            expect(mockPrismaService.property.create).toHaveBeenCalledWith({
                data: {
                    title: createPropertyDto.title,
                    description: createPropertyDto.description,
                    type: createPropertyDto.type,
                    amount: createPropertyDto.amount,
                    duration: createPropertyDto.duration,
                    address: createPropertyDto.address,
                    city: createPropertyDto.city,
                    state: createPropertyDto.state,
                    country: createPropertyDto.country,
                    ownerId: 'user1',
                    area: createPropertyDto.area,
                },
            });
            expect(mockCloudinaryService.uploadMultipleImages).toHaveBeenCalledWith(files, '1');
        });
    });

    describe('findAll', () => {
        it('should return paginated properties', async () => {
            const query: QueryPropertyDto = { page: 1, limit: 10, state: 'TestState' };
            const mockProperties = [
                {
                    id: '1',
                    title: 'Property 1',
                    images: [],
                    user: { id: 'u1', name: 'User 1', phone: '123' },
                },
            ];
            const total = 1;

            mockPrismaService.$transaction.mockResolvedValue([mockProperties, total]);

            const result = await service.findAll(query);

            expect(result).toEqual({
                data: mockProperties,
                meta: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
            expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
                expect.any(Object),
                expect.any(Object),
            ]);
        });
    });

    describe('findAllForAdmins', () => {
        it('should return properties for admins with owner filter', async () => {
            const query: QueryPropertyDto = { page: 1, limit: 10 };
            const ownerId = 'user1';
            const mockProperties = [{ id: '1', title: 'Property 1', images: [] }];
            const total = 1;

            mockPrismaService.$transaction.mockResolvedValue([mockProperties, total]);

            const result = await service.findAllForAdmins(query, ownerId);

            expect(result).toEqual({
                data: mockProperties,
                meta: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        });

        it('should return all properties for admins without owner filter', async () => {
            const query: QueryPropertyDto = { page: 1, limit: 10 };
            const mockProperties = [{ id: '1', title: 'Property 1', images: [] }];
            const total = 1;

            mockPrismaService.$transaction.mockResolvedValue([mockProperties, total]);

            const result = await service.findAllForAdmins(query);

            expect(result).toEqual({
                data: mockProperties,
                meta: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a property if found', async () => {
            const mockProperty = { id: '1', title: 'Property 1', images: [] };
            mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);

            const result = await service.findOne('1');

            expect(result).toEqual(mockProperty);
            expect(mockPrismaService.property.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                relationLoadStrategy: 'join',
                include: { images: true },
            });
        });

        it('should throw HttpException if property not found', async () => {
            mockPrismaService.property.findUnique.mockResolvedValue(null);

            await expect(service.findOne('1')).rejects.toThrow(
                new HttpException('Property not found', HttpStatus.NOT_FOUND)
            );
        });
    });

    describe('update', () => {
        it('should update a property successfully', async () => {
            const updatePropertyDto: UpdatePropertyDto = {
                title: 'Updated Title',
                amount: 2000,
            };
            const existingProperty = {
                id: '1',
                title: 'Old Title',
                description: 'Old Desc',
                type: PropertyType.FLAT,
                amount: 1000,
                address: 'Old Address',
                city: 'Old City',
                state: 'Old State',
                duration: Duration.MONTHLY,
            };
            const updatedProperty = { ...existingProperty, ...updatePropertyDto };

            mockPrismaService.property.findUnique.mockResolvedValue(existingProperty);
            mockPrismaService.property.update.mockResolvedValue(updatedProperty);

            const result = await service.update('1', 'user1', updatePropertyDto);

            expect(result).toEqual(updatedProperty);
            expect(mockPrismaService.property.update).toHaveBeenCalledWith({
                where: { id: '1', ownerId: 'user1' },
                data: {
                    title: 'Updated Title',
                    description: 'Old Desc',
                    type: PropertyType.FLAT,
                    amount: 2000,
                    address: 'Old Address',
                    city: 'Old City',
                    state: 'Old State',
                    duration: Duration.MONTHLY,
                },
            });
        });

        it('should throw HttpException if property not found', async () => {
            mockPrismaService.property.findUnique.mockResolvedValue(null);

            await expect(service.update('1', 'user1', {})).rejects.toThrow(
                new HttpException('Property to update not found!.', HttpStatus.NOT_FOUND)
            );
        });
    });

    describe('remove', () => {
        it('should delete a property successfully', async () => {
            const mockProperty = { id: '1', title: 'Property 1' };
            mockPrismaService.property.findUnique.mockResolvedValue(mockProperty);
            mockPrismaService.property.delete.mockResolvedValue(mockProperty);

            const result = await service.remove('1', 'user1');

            expect(result).toEqual({ message: 'Property deleted successfully' });
            expect(mockPrismaService.property.delete).toHaveBeenCalledWith({
                where: { id: '1', ownerId: 'user1' },
            });
        });

        it('should throw HttpException if property not found', async () => {
            mockPrismaService.property.findUnique.mockResolvedValue(null);

            await expect(service.remove('1', 'user1')).rejects.toThrow(
                new HttpException('Property not found!.', HttpStatus.NOT_FOUND)
            );
        });
    });
});

//     const result = await service.create(createPropertyDto, files);
//     expect(result).toHaveProperty('status', 'success');
//     expect(result).toHaveProperty('message', 'Property created successfully');
//   });

// });
