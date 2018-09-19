import Application from '../LKApplication'
import EventTarget from '../../common/core/EventTarget'
import MFApply from '../store/MFApply'
import ConfigManager from '../../common/core/ConfigManager'
class MFApplyManager extends EventTarget{

    start(){

    }
    asyAddNewMFApply(apply){
        return new Promise((resolve,reject)=>{
            MFApply.add(apply,Application.getCurrentApp().getCurrentUser().id).then(()=>{
                this.fire("receiveMFApply");
                resolve();
            });
        });

    }

    asyGetAll() {
        return MFApply.getAll(Application.getCurrentApp().getCurrentUser().id);
    }

    async accept(contactId){
        return new Promise((resolve,reject)=>{
            let userId = Application.getCurrentApp().getCurrentUser().id;
            
            MFApply.accept(contactId,userId).then(()=>{
                MFApply.get(contactId,userId).then((friend)=>{
                    Application.getCurrentApp().getLKWSChannel().acceptMF(contactId,friend.serverIP,friend.serverPort).then(()=>{
                        ConfigManager.getContactManager().asyAddNewFriend(friend).then(()=>{
                            resolve();
                        });
                    });
                });
            });
        });

    }

}


module.exports = new MFApplyManager();

