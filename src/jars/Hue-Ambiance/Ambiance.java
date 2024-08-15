/**
 * Handling fetching stuff / Communication with the bridge --> setting actual colors to LED - Strips
 */
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.CompletableFuture;
import java.io.IOException;
import java.awt.Color;

public class Ambiance {
    private static BridgeCommunicator bridgeCommunicator;
    public static DesktopSync desktop = new DesktopSync();
    public String key;
    public String mode = "not defined yet";
    public String type = "dimmable";
    private int objectKey;

    private String apiKey = JSONReceiver.apiKey;
    private String IP = JSONReceiver.IP;

    private String[] forestAnimationHex = {"#bdeaa0","#9cdd71","#80df42","#7dec33","#3c8e04","#3d7c11","#375621","#2c5421","#1b4411","#2c5219","#63fb1b","#254b12","#050c01"};
    public void register(String key2,  String mode2, int objectKey2, String type2) { // complete new light detected
        key = key2;
        type = type2;
        //mode = mode2;
        objectKey = objectKey2;
        bridgeCommunicator = new BridgeCommunicator(IP, apiKey);
        System.out.println(key+"   "+mode);

        changeTo(mode2);
    }

    public void delete() { // delete action for instance of Ambiance class
        System.out.println("deleted: "+key);
        try {
            desktop.screenColorSyncRemoveLight(objectKey);
        } catch(Exception e) {

        }
        mode = "deleted";
    }
    
    public void changeTo(String modeNew) { // new mode detected
        if (!mode.equals(modeNew)) {
            System.out.println("key change to: "+modeNew);
            mode = modeNew;

            CompletableFuture.runAsync(() -> { // while isn't optimal ofc
                    try // prototype color setting --> just for testing purposes
                    {
                        if(type == "rgb") {
                            if (mode.equals("party")) {
                                while(mode.equals("party")) {
                                    bridgeCommunicator.putColor(objectKey,ThreadLocalRandom.current().nextInt(0, 255 + 1), ThreadLocalRandom.current().nextInt(0, 255 + 1), ThreadLocalRandom.current().nextInt(0, 255 + 1));
                                    sleep(200);
                                }
                            } else if (mode.equals("forest")) {
                                int counter = 0;
                                while(mode.equals("forest")) {
                                    Color newColor = Color.decode(forestAnimationHex[counter]);
                                    bridgeCommunicator.putColor(objectKey,newColor.getRed(), newColor.getGreen(), newColor.getBlue());
                                    sleep(690);
                                    if (counter < forestAnimationHex.length - 1) {
                                        counter++;
                                    } else {
                                        counter = 0;
                                    }
                                }
                            } else if (mode.equals("background")) {
                                desktop.screenColorSyncAddLight(objectKey, IP, apiKey,type);
                                while(mode.equals("background")) { // ()
                                    sleep(380);
                                }
                                desktop.screenColorSyncRemoveLight(objectKey);
                            } else if (mode.equals("fire")) {
                                int randomNum = 200;
                                bridgeCommunicator.putColor(objectKey,247,170,4);
                                while(mode.equals("fire")) {
                                    int maxPlus = randomNum + 40;
                                    int maxMinus = randomNum - 40;
                                    /*
                                    int maxPlus = randomNum+ 55;
                                    int maxMinus = randomNum -55;
                                     */
                                    randomNum = ThreadLocalRandom.current().nextInt(maxMinus >= 140 ? maxMinus : 140, maxPlus <= 255 ? maxPlus : 255 + 1);
                                    bridgeCommunicator.putBrightness(objectKey, randomNum);
                                    sleep(100);
                                }
                            }
                        } else {
                            if (mode.equals("background")) {
                                desktop.screenColorSyncAddLight(objectKey, IP, apiKey,type);
                                while(mode.equals("background")) {
                                    sleep(380);
                                }
                                desktop.screenColorSyncRemoveLight(objectKey);
                            }
                        }
                    }
                    catch (java.io.IOException ioe)
                    {
                        ioe.printStackTrace();
                    }
                });

        }
    }

    private void sleep (int delay) {
        try
        {
            Thread.sleep(delay);
        }
        catch (InterruptedException ie)
        {
            ie.printStackTrace();
        }
    }
}