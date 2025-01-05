import { describe, it, expect, beforeEach, vi } from "vitest";
import ItemRepository from "./itemRepository.mjs";
import AuditLogRepository from "./auditLogRepository.mjs";

describe("ItemRepository", () => {
    let itemRepository;
    let mockModel;
    let mockCurrentUser;

    beforeEach(() => {
        mockModel = {
            createCollection: vi.fn(),
            create: vi.fn(),
            updateOne: vi.fn().mockReturnThis(),
            deleteOne: vi.fn().mockReturnThis(),
            countDocuments: vi.fn().mockReturnThis(),
            findById: vi.fn(),
            find: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            collation: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            exec: vi.fn(),
        };

        mockCurrentUser = { _id: "user123", name: "Test User" };
        itemRepository = new ItemRepository(mockModel);
        // Mock AuditLogRepository
        vi.spyOn(itemRepository.auditLogRepository, "log").mockResolvedValue();
    });

    describe("create", () => {
        it("should create an item and log the action", async () => {
            const itemData = {
                name: "Test Item",
                description: "Test Description",
            };
            const createdItem = { _id: "item123", ...itemData };

            mockModel.create.mockResolvedValue([createdItem]);
            mockModel.findById.mockResolvedValue(createdItem);

            const result = await itemRepository.create(
                itemData,
                mockCurrentUser,
            );

            expect(mockModel.createCollection).toHaveBeenCalled();
            expect(mockModel.create).toHaveBeenCalledWith([itemData]);
            expect(itemRepository.auditLogRepository.log).toHaveBeenCalledWith(
                {
                    action: AuditLogRepository.CREATE,
                    entityId: "item123",
                    entityName: "item",
                    values: itemData,
                },
                mockCurrentUser,
            );
            expect(result).toEqual(createdItem);
        });
    });

    describe("update", () => {
        it("should update an item and log the action", async () => {
            const itemId = "item123";
            const updateData = { name: "Updated Item" };
            const updatedItem = { _id: itemId, ...updateData };

            mockModel.findById.mockResolvedValue(updatedItem);
            mockModel.exec.mockResolvedValue({ modifiedCount: 1 });

            const result = await itemRepository.update(
                itemId,
                updateData,
                mockCurrentUser,
            );

            expect(mockModel.updateOne).toHaveBeenCalledWith(
                { _id: itemId },
                updateData,
            );
            expect(itemRepository.auditLogRepository.log).toHaveBeenCalledWith(
                {
                    action: AuditLogRepository.UPDATE,
                    entityId: itemId,
                    entityName: "item",
                    values: updateData,
                },
                mockCurrentUser,
            );
            expect(result).toEqual(updatedItem);
        });
    });

    describe("findAndCountAll", () => {
        it("should return filtered and paginated results", async () => {
            const filter = {
                name: "Test",
            };
            const limit = 10;
            const offset = 0;
            const orderBy = "name_ASC";

            const mockItems = [
                {
                    _id: "item123",
                    name: "Test Item",
                    description: "Description",
                },
                {
                    _id: "item456",
                    name: "Another Item",
                    description: "Another Description",
                },
            ];

            mockModel.exec.mockResolvedValueOnce(mockItems);
            mockModel.exec.mockResolvedValueOnce(2);

            const result = await itemRepository.findAndCountAll({
                filter,
                limit,
                offset,
                orderBy,
            });

            expect(result).toEqual({
                count: 2,
                rows: mockItems,
            });
            expect(mockModel.find).toHaveBeenCalled();
            expect(mockModel.countDocuments).toHaveBeenCalled();
        });
    });

    describe("findAllAutocomplete", () => {
        it("should return formatted autocomplete results", async () => {
            const search = "test";
            const limit = 10;
            const mockRecords = [
                { _id: "item1", name: "Test Item 1" },
                { _id: "item2", name: "Test Item 2" },
            ];

            mockModel.exec.mockResolvedValue(mockRecords);

            const result = await itemRepository.findAllAutocomplete(
                search,
                limit,
            );

            expect(result).toEqual([
                { _id: "item1", name: "Test Item 1" },
                { _id: "item2", name: "Test Item 2" },
            ]);
            expect(mockModel.find).toHaveBeenCalled();
            expect(mockModel.limit).toHaveBeenCalled();
            expect(mockModel.sort).toHaveBeenCalled();
        });
    });

    describe("destroy", () => {
        it("should delete an item and log the action", async () => {
            const itemId = "item123";
            mockModel.exec.mockResolvedValue({ deletedCount: 1 });

            await itemRepository.destroy(itemId, mockCurrentUser);

            expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: itemId });
            expect(itemRepository.auditLogRepository.log).toHaveBeenCalledWith(
                {
                    action: AuditLogRepository.DELETE,
                    entityId: itemId,
                    entityName: "item",
                    values: null,
                },
                mockCurrentUser,
            );
        });
    });

    describe("findByName", () => {
        it("should find items by name", async () => {
            const name = "Test Item";
            const mockItems = [{ _id: "item1", name: "Test Item" }];

            mockModel.find.mockResolvedValue(mockItems);

            const result = await itemRepository.findByName(name);

            expect(mockModel.find).toHaveBeenCalledWith({ name });
            expect(result).toEqual(mockItems);
        });
    });

    describe("findByNameAndNotId", () => {
        it("should find items by name excluding specific id", async () => {
            const name = "Test Item";
            const id = "item1";
            const mockItems = [{ _id: "item2", name: "Test Item" }];

            mockModel.find.mockResolvedValue(mockItems);

            const result = await itemRepository.findByNameAndNotId(name, id);

            expect(mockModel.find).toHaveBeenCalledWith({
                name: name,
                _id: { $ne: id },
            });
            expect(result).toEqual(mockItems);
        });
    });
});
