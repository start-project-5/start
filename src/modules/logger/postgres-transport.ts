import TransportStream from 'winston-transport';
import { DataSource } from 'typeorm';
import { Log } from './logger.entity';
import { LogLevel } from 'src/common/enum/logger-level.enum';

export class PostgresTransport extends TransportStream {
  constructor(private dataSource: DataSource) {
    super();
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    const logRepo = this.dataSource.getRepository(Log);

    const log = logRepo.create({
      level: info.level as LogLevel,
      message: info.message,
      context: info.context,
      stack: info.stack,
    });

    await logRepo.save(log).catch(console.error);

    callback();
  }
}
