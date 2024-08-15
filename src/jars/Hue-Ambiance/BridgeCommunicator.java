import java.io.IOException;
import java.io.DataOutputStream;

import java.net.URLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.io.OutputStreamWriter;

import com.google.gson.*;

public class BridgeCommunicator {
    public static String ip;
    public static String apiKey;
    private static ColorConvertion colorConvertion = new ColorConvertion();
    
    public BridgeCommunicator(String ip2, String apiKey2) {
        ip = ip2;
        apiKey = apiKey2;
    }

    public static JsonObject get(String endPath) throws Exception{
        URL oracle = new URL("http://"+ip+"/api/"+apiKey+"/"+endPath);
        URLConnection yc = oracle.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(
                    yc.getInputStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            return JsonParser.parseString(inputLine).getAsJsonObject();
        }
        in.close();
        return new JsonObject();
    }
    public static int counter = 0;
    public static String putColor(int keyNumber, int r, int g, int b) throws IOException{
        counter++;
        /*URL url = new URL("http://"+ip+"/api/"+apiKey+"/lights/"+keyNumber+"/state");
        System.out.println(url.toString());
        HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
        httpCon.setDoOutput(true);
        httpCon.setDoInput(true);
        httpCon.setRequestMethod("PUT");
        OutputStreamWriter out = new OutputStreamWriter(
        httpCon.getOutputStream());
         */
        
        
        
        /**
        JsonObject jsonObject = new JsonObject();

        JsonArray array = new JsonArray();
        double[] xy = colorConvertion.rgbToXy(r,g,b);
        double x = xy[0];
        double y = xy[1];
        array.add(x);
        array.add(y);
        jsonObject.add("xy",array);

        //System.out.println(jsonObject.toString());
        //out.write(jsonObject.toString());
        //out.close();
        //httpCon.getInputStream();

        HttpURLConnection con = null;
        String result = null;
        //result is the response you get from the remote side

        return "new";
        **/
        JsonObject jsonObject = new JsonObject();

        JsonArray array = new JsonArray();
        double[] xy = colorConvertion.rgbToXy(r,g,b);
        double x = xy[0];
        double y = xy[1];
        array.add(x);
        array.add(y);
        jsonObject.add("xy",array);
        
        yourmethod("http://"+ip+"/api/"+apiKey+"/lights/"+keyNumber+"/state","PUT",jsonObject.toString());
        //System.out.println("http://"+ip+"/api/"+apiKey+"/lights/"+keyNumber+"/state");
        return "new";
    }
    
    public static String putBrightness(int keyNumber, int bri) {
        JsonObject jsonObject = new JsonObject();

        JsonArray array = new JsonArray();

        jsonObject.addProperty("bri", bri);
        
        yourmethod("http://"+ip+"/api/"+apiKey+"/lights/"+keyNumber+"/state","PUT",jsonObject.toString());
        //System.out.println("http://"+ip+"/api/"+apiKey+"/lights/"+keyNumber+"/state");
        return "new";
    }
    
    
    
    
    public static  HttpURLConnection getHttpConnection(String url, String type){
        URL uri = null;
        HttpURLConnection con = null;
        try{
            uri = new URL(url);
            con = (HttpURLConnection) uri.openConnection();
            con.setRequestMethod(type); //type: POST, PUT, DELETE, GET
            con.setDoOutput(true);
            con.setDoInput(true);
            con.setConnectTimeout(60000); //60 secs
            con.setReadTimeout(60000); //60 secs
            con.setRequestProperty("Accept-Encoding", "Your Encoding");
            con.setRequestProperty("Content-Type", "Your Encoding");
        }catch(Exception e){
            //logger.info( "connection i/o failed" );
        }
        return con;
    }

    public static void yourmethod(String url, String type, String reqbody){
        HttpURLConnection con = null;
        String result = null;
        try {
            con = getHttpConnection( url , type);
            //you can add any request body here if you want to post
            if( reqbody != null){  
                con.setDoInput(true);
                con.setDoOutput(true);
                DataOutputStream out = new  DataOutputStream(con.getOutputStream());
                out.writeBytes(reqbody);
                out.flush();
                out.close();
            }
            con.connect();
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String temp = null;
            StringBuilder sb = new StringBuilder();
            while((temp = in.readLine()) != null){
                sb.append(temp).append(" ");
            }
            result = sb.toString();
            //System.out.println("RESPO: "+counter+ "  "+ result);
            in.close();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            //logger.error(e.getMessage());
        }
        //result is the response you get from the remote side
    }
}