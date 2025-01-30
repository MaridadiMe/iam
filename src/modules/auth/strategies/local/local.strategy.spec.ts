import { Test, TestingModule } from "@nestjs/testing";
import { LocalStrategy } from "./local.strategy";
import { UserService } from "../../services/user.service";
import { UnauthorizedException } from "@nestjs/common";



describe('LocalStrategy', ()=>{
    let localStrategy: LocalStrategy;
    let userService: UserService;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
               LocalStrategy,
               {
                provide: UserService,
                useValue: {
                    validateUser: jest.fn()
                }
               } 
            ]
        }).compile();

        localStrategy = module.get<LocalStrategy>(LocalStrategy);
        userService = module.get<UserService>(UserService);

    });

    const validatedUser = {
        id: 1,
        first_name: 'crossroad',
        last_name: 'Seho',
        phone: '0712345678',
        email: 'test@example.com',
        phone_verified: false,
        email_verified: false,
        date_created: '2024-08-12T11:35:30.150Z',
        is_active: true
      }

    it('Should throw UnauthorizedException if user is not found', async () => {
        jest.spyOn(userService, 'validateUser').mockResolvedValue(null);
    
        const username = 'test@example.com';
        const password = 'wrongpassword';
    
        // Expect the validate method to throw UnauthorizedException when no user is found
        await expect(localStrategy.validate(username, password)).rejects.toThrow(UnauthorizedException);
        expect(userService.validateUser).toHaveBeenCalledWith(username, password);
    });

    it('Should return a user once validated', async () => {
        jest.spyOn(userService, 'validateUser').mockResolvedValue(validatedUser);
    
        const username = 'test@example.com';
        const password = 'correctpassword';
    
        // Expect the validate method to throw UnauthorizedException when no user is found
        const result = await localStrategy.validate(username, password);
        expect(result).toEqual(validatedUser);
        expect(userService.validateUser).toHaveBeenCalledWith(username, password);
    });

});