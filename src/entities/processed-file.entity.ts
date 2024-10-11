import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProcessedFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  processedAt: Date;
}
