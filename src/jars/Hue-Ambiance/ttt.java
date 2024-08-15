public class ttt
{}
/**
 * Write a description of class ttt here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
/**
import javax.sound.sampled.*;
public class ttt
{
    // instance variables - replace the example below with your own
    public static AudioFormat getFormat() {        
        float sampleRate = 8000;       
        int sampleSizeInBits = 16;      
        int channels = 2;      
        boolean signed = true;   
        boolean bigEndian = true;     
        return new AudioFormat(sampleRate, sampleSizeInBits, channels, signed, bigEndian);     
    }

    public static void a () {
        Mixer.Info[] mixerInfo = AudioSystem.getMixerInfo();
        for (int i = 0; i < mixerInfo.length; ++i) {
            Mixer mixer = AudioSystem.getMixer(mixerInfo[i]);
            try
            {
                //System.out.println(mixer);
                mixer.open();
            }
            catch (LineUnavailableException lue)
            {
                lue.printStackTrace();
            }
            //System.out.format("%s: %s %s %s %s%n", mixerInfo, mixerInfo[i].getName(), mixerInfo[i].getVendor(), mixerInfo[i].getVersion(), mixerInfo[i].getDescription());
            //we check only target type lines, because we are looking for "SPEAKER target port"
            
            /*
            final AudioFormat format = getFormat();
            System.out.println(format);
                DataLine.Info infob = new DataLine.Info(TargetDataLine.class, format);    
                try
                {
                    final TargetDataLine line = (TargetDataLine) mixer.getLine(infob);
                    try
                    {
                        line.open(format);
                    }
                    catch (LineUnavailableException lue)
                    {
                        lue.printStackTrace();
                    }     
                    line.start();
                }
                catch (LineUnavailableException lue)
                {
                    lue.printStackTrace();
                }   
                */
               
            /*for (Line.Info info : mixer.getTargetLineInfo()) {
                final AudioFormat format = getFormat();
                DataLine.Info infob = new DataLine.Info(TargetDataLine.class, format);    
                try
                {
                    final TargetDataLine line = (TargetDataLine) mixer.getLine(info);
                    try
                    {
                        line.open(format);
                    }
                    catch (LineUnavailableException lue)
                    {
                        lue.printStackTrace();
                    }     
                    line.start();
                }
                catch (LineUnavailableException lue)
                {
                    lue.printStackTrace();
                }        
                
                System.out.println(info);
                if (info.toString().contains("SPEAKER")) {
                try
                {
                    Line line = mixer.getLine(info);
                }
                catch (LineUnavailableException lue)
                {
                    lue.printStackTrace();
                }
                try {
                line.open();
                FloatControl volumeControl = (FloatControl) line.getControl(FloatControl.Type.AUX_RETURN);
                System.out.println(volumeControl);
                } catch (IllegalArgumentException iae) {}
                }
            }
        }
    }

}
*/