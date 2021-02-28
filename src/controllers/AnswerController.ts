import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { AppError } from '../errors/AppError';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class AnswerController {

    //http://localhost:3333/answers/1?u=d34f05af-39f6-4220-84b3-56d21bdc1654

    //Route params = parâmetros que compõem a rota
    //routes.get("/answers/:value");

    //query params = busca, paginação - não é obrigatório - vem sempre depois do ?
    //chave=valor

    async execute(request: Request, response: Response) {
        const { value } = request.params;
        const { u }= request.query;

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository); 
        
        const surveyUser = await surveysUsersRepository.findOne({
            id: String(u),
        });

        if(!surveyUser) {
            throw new AppError("Survey User does not exists!"); 
            /*return response.status(400).json({
                error: "Survey User does not exists!",
            });
            */
        }

        surveyUser.value = Number(value);

        await surveysUsersRepository.save(surveyUser);

        return response.json(surveyUser);
    }

}

export { AnswerController };