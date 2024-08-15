import java.awt.Color;
import java.awt.image.BufferedImage;
import java.awt.AWTException;
import java.awt.Robot;
import java.awt.Rectangle;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.TargetDataLine;
import javax.sound.sampled.Line;
import javax.sound.sampled.FloatControl;
/**
 * Handling getting colors from screen || getting audio volume and convert to colors etc. --> desktop info related stuff
 * (no fetching --> done in bridgeCommunicator after Ambiance class instance calls it, ... here just returning Colors)
 */
public class DesktopSync
{ // statics are "OK" bc we only need one instace ()
    public static Color backgroundColor;
    public static ArrayList<Integer> lightKeys = new ArrayList<Integer>();
    public static HashMap<String, String> lightTypes = new HashMap<String, String>();
    public static boolean screenBackgroundSyncAlreadyRunning = false;
    public static BridgeCommunicator bridgeCommunicator;
    public static int dimmMin = 0;
    public static int dimmMax = 255;
    public static int sensitivityLuminance = 20;
    public static int sensitivityRGB = 1;
    public static int dimmableSensitivityMultiplier = 1;
    public static void test() throws Exception {

        Mixer.Info[] mixerInfo = AudioSystem.getMixerInfo();
        //System.out.println(mixerInfo);

        for (int i = 0; i < mixerInfo.length; ++i) {
            Mixer mixer = AudioSystem.getMixer(mixerInfo[i]);
            //System.out.println(mixer);
            mixer.open();
            System.out.format("%s: %s %s %s %s%n", mixerInfo, mixerInfo[i].getName(), mixerInfo[i].getVendor(), mixerInfo[i].getVersion(), mixerInfo[i].getDescription());
            //we check only target type lines, because we are looking for "SPEAKER target port"
            for (Line.Info info : mixer.getTargetLineInfo()) {
                System.out.println(info);
                if (info.toString().contains("SPEAKER")) {
                    Line line = mixer.getLine(info);
                    try {
                        line.open();
                        FloatControl volumeControl = (FloatControl) line.getControl(FloatControl.Type.AUX_RETURN);
                        System.out.println(volumeControl);
                    } catch (IllegalArgumentException iae) {}
                }
            }
        }
        //System.out.println(AudioSystem.getMixerInfo()[0]);
    }

    public static void screenColorSyncAddLight(int key, String IP, String apiKey, String type) {
        System.out.println("ADDED");
        bridgeCommunicator = new BridgeCommunicator(IP, apiKey);

        lightKeys.add(key);
        lightTypes.put(Integer.toString(key),type);
        if (!screenBackgroundSyncAlreadyRunning) {
            CompletableFuture.runAsync(() -> {
                    syncScreenBackground();
                });
        }
    }

    public static void screenColorSyncRemoveLight(int key) {
        lightKeys.remove(lightKeys.indexOf(key));
        System.out.println("REMOVED: "+key);
    }

    private static void syncScreenBackground() {
        screenBackgroundSyncAlreadyRunning = true;

        int lastLuminanceSet = -500;
        int lastRSet = -500;
        int lastGSet = -500;
        int lastBSet = -500;
        while(lightKeys.size() > 0) {
            Color newColor = screenColorAvg();   
            int r = newColor.getRed();
            int g = newColor.getGreen();
            int b = newColor.getBlue();
            for (int i = 0; i < lightKeys.size(); ++i) {
                try
                {
                    int myKey = lightKeys.get(i);
                    String myType = lightTypes.get(Integer.toString(myKey));
                    if (myType == "rgb") {

                        if (/*(Math.abs(r-lastRSet) + Math.abs(g-lastGSet) + Math.abs(b-lastBSet))> sensitivityRGB*/Math.abs(r-lastRSet) > sensitivityRGB || Math.abs(g-lastGSet) > sensitivityRGB || Math.abs(b-lastBSet) > sensitivityRGB) {
                            System.out.println("changed rgb value"+dimmMin);
                            bridgeCommunicator.putColor(myKey,r, g, b);
                            lastRSet = r;
                            lastGSet = g;
                            lastBSet = b;
                        }
                    } else {
                        int luminance = (int) Math.sqrt(0.299 * Math.pow(r,2) + 0.587 * Math.pow(g,2) + 0.114 * Math.pow(b,2));
                        //int luminanceInBriNum = (int)((luminance/6.0)*254.0);
                        if (Math.abs(lastLuminanceSet-luminance) > sensitivityLuminance) { // if abs of luminanceNow - luminanceBefore > 20 --> only then setting actual new refrence-value for hue-system
                            int brightness = (int) (dimmMin + (luminance/255) * (dimmMax - dimmMin) * dimmableSensitivityMultiplier);
                            if (brightness > 255) {
                                brightness = 255;
                            }
                            bridgeCommunicator.putBrightness(myKey, brightness); // min and max shouldn't actually be switched! --> Ambiance should pass it the right way
                            lastLuminanceSet = luminance;
                            System.out.println("changed dimmable value");
                        }
                    }
                    //System.out.println(lumianceInBriNum);
                }
                catch (IOException ioe)
                {
                    ioe.printStackTrace();
                }
            }
            try
            {
                Thread.sleep(80);
            }
            catch (InterruptedException ie)
            {
                ie.printStackTrace();
            }   
        }
        screenBackgroundSyncAlreadyRunning = false;
    }

    /*
     * Where bi is your image, (x0,y0) is your upper left coordinate, and (w,h)
     * are your width and height respectively
     */
    private static Color averageColor(BufferedImage bi, int x0, int y0, int w,
    int h) {
        int x1 = x0 + w;
        int y1 = y0 + h;
        long sumr = 0, sumg = 0, sumb = 0;
        int refrence_counter = 0;
        int step = 35;
        for (int x = x0; x < x1-step; x += step) {
            for (int y = y0; y < y1-step; y+= step) {
                Color pixel = new Color(bi.getRGB(x, y));
                sumr += pixel.getRed() *step;
                sumg += pixel.getGreen() *step;
                sumb += pixel.getBlue() *step;
                refrence_counter+=step;
            }
        }
        //int num = w*h;
        /*System.out.println("detected pixels: "+ refrence_counter);
        System.out.println("resSumr: "+sumr);
        System.out.println("resSumg: "+sumg);
        System.out.println("resSumb: "+sumb);
        System.out.println("resDivr: "+sumr/num);
        System.out.println("resDivg: "+sumg/num);
        System.out.println("resDivb: "+sumb/num);*/
        /*System.out.println("R:"+(int) sumr / refrence_counter);
        System.out.println("G:"+(int) sumg / refrence_counter);
        System.out.println("B:"+(int) sumb / refrence_counter);*/
        return new Color((int) sumr / refrence_counter, (int) sumg / refrence_counter,(int) sumb / refrence_counter);
    }

    private static BufferedImage getScreen() throws AWTException {
        Robot robot = new Robot();
        BufferedImage resScreen = robot.createScreenCapture(new Rectangle(java.awt.Toolkit
                    .getDefaultToolkit().getScreenSize()));
        /*JFrame frame = new JFrame();
        frame.getContentPane().setLayout(new FlowLayout());
        frame.getContentPane().add(new JLabel(new ImageIcon(resScreen)));
        frame.pack();
        frame.setVisible(true);*/
        return resScreen;
    }

    // related commands
    public static Color screenColorAvg() {
        //long startTime = System.nanoTime();
        Color avg = null;
        try
        {
            BufferedImage bufImg = getScreen();
            avg = averageColor(bufImg,0,0, bufImg.getWidth(), bufImg.getHeight());
            //System.out.print(avg);
        }
        catch (AWTException awte)
        {
            awte.printStackTrace();
        }
        //long endTime = System.nanoTime();
        //long duration = (endTime - startTime);
        //System.out.println("duration (in ms) (getting screen avgCol): "+ duration/1000000); // process takes more or less (in my case) ca. 15.3 % of a second. == 153 ms
        //System.out.println(avg);
        return avg;
    }
}