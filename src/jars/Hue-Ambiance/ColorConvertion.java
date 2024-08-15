
/**
 * doing convertion stuff such as rgb to xy value
 */
public class ColorConvertion
{

    public double[] rgbToXy(int r, int g, int b)
    {
        double red = r;
        double green = g;
        double blue = b;
        if (red > 0.04045) {
            red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
        } else  {
         red = red / 12.92;   
        }

        if (green > 0.04045) {
            green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
        }else {
            green = green / 12.92;
        }

        if (blue > 0.04045) {
            blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
        } else  {
            blue = blue / 12.92;
        }

        double X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
        double Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
        double Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

        double x = X / (X + Y + Z);
        double y = Y / (X + Y + Z);
        
        return new double[] {x,y};

        /*int red = r;
        int green = g;
        int blue = b;

        double redC = (red / 255);
        double greenC = (green / 255);
        double blueC = (blue / 255);

        double redN = (redC > 0.04045) ? Math.pow((redC + 0.055) / (1.0 + 0.055), 2.4) : (redC / 12.92);
        double greenN = (greenC > 0.04045) ? Math.pow((greenC + 0.055) / (1.0 + 0.055), 2.4) : (greenC / 12.92);
        double blueN = (blueC > 0.04045) ? Math.pow((blueC + 0.055) / (1.0 + 0.055), 2.4) : (blueC / 12.92);

        double X = redN * 0.664511 + greenN * 0.154324 + blueN * 0.162028;

        double Y = redN * 0.283881 + greenN * 0.668433 + blueN * 0.047685;

        double Z = redN * 0.000088 + greenN * 0.072310 + blueN * 0.986039;

        double x = X / (X + Y + Z);

        double y = Y / (X + Y + Z);
        X = x * 65536;
        Y = y * 65536;
        System.out.println(x);
        System.out.println(y);
        double[] xy = {x,y};
        return xy;*/
    }
}
