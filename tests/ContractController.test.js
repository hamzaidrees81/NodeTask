const { getContractById } = require('../src/controllers/ContractController');
const { Contract } = require('../src/models');

jest.mock('../src/models', () => ({
  Contract: {
    findOne: jest.fn(),
  },
}));

describe('getContractById', () => {
  it('should get a contract by id when it exists for the profile', async () => {
    const mockedReq = {
      get: jest.fn().mockReturnValue(2),
      params: { id: 3 },
    };

    const mockedContract = {
      id: 3,
      terms: 'bla bla bla',
      status: 'in_progress',
      createdAt: '2023-11-27T12:31:32.924Z',
      updatedAt: '2023-11-27T12:31:32.924Z',
      contractorId: 6,
      clientId: 2,
    };

    Contract.findOne.mockResolvedValue(mockedContract);

    const mockedJson = jest.fn();
    const mockedRes = {
      status: jest.fn().mockReturnThis(),
      json: mockedJson,
    };

    // Mocking the entire getContractById function
    const originalGetContractById = getContractById;
    const getContractByIdMock = jest.fn().mockImplementation(originalGetContractById);

    await getContractByIdMock(mockedReq, mockedRes);

    expect(Contract.findOne).toHaveBeenCalledTimes(1);
    expect(mockedJson).toHaveBeenCalledWith(mockedContract);
  });
});
