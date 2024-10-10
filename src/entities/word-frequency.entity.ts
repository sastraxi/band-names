import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['frequency', 'word'])
export class WordFrequency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  word: string;

  @Column()
  frequency: number;
}
