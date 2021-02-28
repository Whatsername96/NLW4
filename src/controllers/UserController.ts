import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

class UserController {

    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required(), //Pode colocar mensagem no required para retornar no erro
            email: yup.string().email().required(),
        });
        //Outra maneira de fazer - um por um
        /*if (!(await schema.isValid(request.body))) {
            return response.status(400).json({
                error: "Validation failed",
            })
        }*/
                
        try {
            await schema.validate(request.body, {abortEarly: false});
        } catch(err) {
            throw new AppError(err); 
        }

        const usersRepository = getCustomRepository(UsersRepository);

        const userAlreadyExists = await usersRepository.findOne({ 
            email
        });

        if(userAlreadyExists) {
            throw new AppError("Survey User does not exists!"); //do JS é throw new error
        }

        const user = usersRepository.create({
            name, 
            email
        });

        await usersRepository.save(user);

        return response.status(201).json(user);
    }

}

export { UserController };