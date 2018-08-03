import ConfigManager from './common/core/ConfigManager'
import ScanView from './common/view/ScanView'
import WSChannel from './lk/net/LKWSChannel'
import ChatManager from './lk/core/ChatManager'
import ContactManager from './lk/core/ContactManager'
import OrgManager from './lk/core/OrgManager'
import UserManager from './lk/core/UserManager'

ConfigManager.configure("WSChannel",WSChannel);
ConfigManager.configure("ChatManager",ChatManager);
ConfigManager.configure("ContactManager",ContactManager);
ConfigManager.configure("OrgManager",OrgManager);
ConfigManager.configure("UserManager",UserManager);
ConfigManager.configure("ScanView",ScanView);


module.exports = ConfigManager;
