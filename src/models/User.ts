import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("users")
class User {
    @PrimaryColumn() //Se o nome do atributo foi igual ao da coluna não é necessário passar parâmetro
    readonly id: string;

    @Column({type:"text"})
    name: string;

    @Column({type:"text"})
    email: string;

    @CreateDateColumn()
    created_at: Date;

    constructor() {
        if(!this.id) {
            this.id = uuid();
        }
    }
}

export { User };