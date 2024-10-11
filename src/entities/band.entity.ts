import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  popularity: number;

  @Column('jsonb')
  spotifyData: object;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
