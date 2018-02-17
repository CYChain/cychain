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

import org.cychain.core.db.BlockStore;
import org.cychain.core.db.Manager;
import org.cychain.core.net.node.Node;
import org.cychain.program.Args;

public interface Application {

  void setOptions(Args args);

  void init(String path, Args args);

  void initServices(Args args);

  void startup();

  void shutdown();

  void startServices();

  void shutdownServices();

  Node getP2pNode();

  BlockStore getBlockStoreS();

  void addService(Service service);

  Manager getDbManager();
}
