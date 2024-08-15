import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.TargetDataLine;
import javax.sound.sampled.Line;
import javax.sound.sampled.FloatControl;
import javax.sound.sampled.*;
import java.io.ByteArrayOutputStream;

/**
 * Write a description of class record here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class record
{
    // instance variables - replace the example below with your own
    private int x;

    /**
     * Constructor for objects of class record
     */
    public record()
    {
        // initialise instance variables
        x = 0;
    }

    public static void test () throws Exception{
        int duration = 1; // sample for 5 seconds
        TargetDataLine line = null;
        // find a DataLine that can be read
        // (maybe hardcode this if you have multiple microphones)
        Mixer.Info[] mixerInfo = AudioSystem.getMixerInfo();
        for (int i = 0; i < mixerInfo.length; i++) {
            Mixer mixer = AudioSystem.getMixer(mixerInfo[i]);
            Line.Info[] targetLineInfo = mixer.getTargetLineInfo();
            System.out.println(i+"   : "+mixerInfo[i]);
            try {
                /*
                if (targetLineInfo.length > 0) {
                line = (TargetDataLine) mixer.getLine(targetLineInfo[0]);
                break;
            }*/
            line = (TargetDataLine) mixer.getLine(targetLineInfo[7]);
                break;
            } catch(Exception e) {
                
            }
        }
        if (line == null)
            throw new UnsupportedOperationException("No recording device found");
        AudioFormat af = new AudioFormat(11000, 8, 1, true, false);
        line.open(af);
        line.start();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[(int)af.getSampleRate() * af.getFrameSize()];
        long end = System.currentTimeMillis() + 1000 * duration;
        int len;
        while (System.currentTimeMillis() < end && ((len = line.read(buf, 0, buf.length)) != -1)) {
            baos.write(buf, 0, len);
        }
        line.stop();
        line.close();
        System.out.println(baos);
        baos.close();
    }
}
