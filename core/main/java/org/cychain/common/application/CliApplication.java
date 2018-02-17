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
import org.cychain.core.peer.Peer;
import org.cychain.program.Args;

public class CliApplication implements Application {

  @Override
  public void setOptions(Args args) {

  }

  @Override
  public void init(String path, Args args) {

  }

  @Override
  public void initServices(Args args) {

  }

  @Override
  public void startup() {

  }

  @Override
  public void shutdown() {

  }

  @Override
  public void startServices() {

  }

  @Override
  public void shutdownServices() {

  }

  @Override
  public Node getP2pNode() {
    return null;
  }

  @Override
  public BlockStore getBlockStoreS() {
    return null;
  }

  @Override
  public void addService(Service service) {

  }

  @Override
  public Manager getDbManager() {
    return null;
  }

  private Peer peer;

//  public CliApplication(Injector injector) {
//    super(injector);
//  }

  public Peer getPeer() {
    return peer;
  }

  public void setPeer(Peer peer) {
    this.peer = peer;
  }
}
