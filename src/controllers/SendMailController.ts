import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import sendMailService from '../services/sendMailService';
import { AppError } from '../errors/AppError';

class SendMailController {
    async execute(request: Request, response: Response){
        const { email, survey_id } = request.body;

        const usersRepository: UsersRepository = getCustomRepository(UsersRepository);
        const surveysRepository: SurveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository: SurveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        
        const user = await usersRepository.findOne({ email });

        if(!user) {
            throw new AppError("Survey User does not exists!"); 
        }

        const survey = await surveysRepository.findOne({id: survey_id});

        if(!survey) {
            throw new AppError("Survey User does not exists!");
        }

        const npsPath = resolve(__dirname, "..","views","emails","npsMail.hbs");

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id ,  value: null }, //Colchetes e chaves separadas faz virar um "or"
            relations: ["user", "survey"],
        });

        const variables ={
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        };

        if(surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await sendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUserAlreadyExists);
        }
        //Salvar as informações na tabela surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id, 
            survey_id
        });

        await surveysUsersRepository.save(surveyUser);
        //Enviar email para o usuário
        variables.id = surveyUser.id;
        await sendMailService.execute(email, survey.title, variables, npsPath);

        return response.json({surveyUser});
    }
}

export { SendMailController }