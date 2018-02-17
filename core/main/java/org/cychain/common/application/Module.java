/*
 * java-cychain is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * java-cychain is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.cychain.common.application;

import static org.cychain.core.Constant.BLOCK_DB_NAME;
import static org.cychain.core.Constant.TRANSACTION_DB_NAME;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import javax.inject.Named;
import org.cychain.common.storage.leveldb.LevelDbDataSourceImpl;
import org.cychain.core.Blockchain;
import org.cychain.core.Constant;
import org.cychain.core.consensus.client.Client;
import org.cychain.core.consensus.server.Server;

public class Module extends AbstractModule {

  @Override
  protected void configure() {

  }

  @Provides
  @Singleton
  public Client buildClient() {
    return new Client();
  }

  @Provides
  @Singleton
  public Server buildServer() {
    return new Server();
  }

  @Provides
  @Singleton
  @Named("transaction")
  public LevelDbDataSourceImpl buildTransactionDb() {
    LevelDbDataSourceImpl db = new LevelDbDataSourceImpl(Constant.NORMAL, Constant.OUTPUT_DIR,
        TRANSACTION_DB_NAME);
    db.initDB();
    return db;
  }

  @Provides
  @Singleton
  @Named("block")
  public LevelDbDataSourceImpl buildBlockDb() {
    LevelDbDataSourceImpl db = new LevelDbDataSourceImpl(Constant.NORMAL, Constant.OUTPUT_DIR,
        BLOCK_DB_NAME);
    db.initDB();
    return db;
  }

  @Provides
  @Singleton
  public Blockchain buildBlockchain(@Named("block") LevelDbDataSourceImpl blockDB) {
    return new Blockchain(blockDB);
  }
}
