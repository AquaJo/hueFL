import java.nio.file.*;
import static java.nio.file.StandardWatchEventKinds.*;
import static java.nio.file.LinkOption.*;
import java.nio.file.attribute.*;
import java.io.*;
import java.util.*;

import com.google.gson.*;

import java.io.FileReader;
import java.util.ArrayList;

import java.nio.file.Files;
import java.nio.file.Paths;

public class JSONReceiver
{
    private static String mode = "packed";
    public static String apiKey;
    public static String IP;
    public static JsonObject activeLights;
    private static String lastJsonString;
    private static ArrayList<String> lastActiveSyncs;
    private static ArrayList<Ambiance> ambianceArray = new ArrayList<Ambiance>();
    public static void main(String[] args) throws IOException {
        if (mode.equals("packed")) {
            try {
                watchFile(System.getProperty("user.dir")+"/jars/","communicator.json");
            } catch(FileNotFoundException e) {
                watchFile(System.getProperty("user.dir"),"communicator.json");
            }
        } else {
            watchFile("../","communicator.json");
        }
    }

    public static void watchFile(String dir, String fileName) throws IOException {
        JSONModified(); // direct call to check whether already delted on start before detection-possibilities

        final Path path = FileSystems.getDefault().getPath(dir);
        System.out.println(path);
        JSONReceiver receiver = new JSONReceiver();
        try (final WatchService watchService = FileSystems.getDefault().newWatchService()) {
            final WatchKey watchKey = path.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);
            while (true) {
                try
                {
                    final WatchKey wk = watchService.take();

                    for (WatchEvent<?> event : wk.pollEvents()) {
                        //we only register "ENTRY_MODIFY" so the context is always a Path.
                        final Path changed = (Path) event.context();
                        System.out.println(changed);
                        if (changed.endsWith(fileName)) {
                            long lastModi=0; //above for loop
                            if(wk==ENTRY_CREATE){
                            }
                            lastModi=changed.toFile().lastModified();

                            JSONModified();
                        }
                    }
                    // reset the key
                    boolean valid = wk.reset();
                    if (!valid) {
                        System.out.println("Key has been unregisterede");
                    }
                }
                catch (InterruptedException ie)
                {
                    ie.printStackTrace();
                }
            }
        }
    }

    public static void JSONModified() {
        System.out.println("some modification detected");
        String json = "";
        try {
            HashMap jsonBuffered = communicatorJSONString();
            if (jsonBuffered != null) {
                json = jsonBuffered.toString();
            }
        } catch (FileNotFoundException fnfe) {
            fnfe.printStackTrace();
        }

        // Überprüfen, ob es eine Änderung in JSON gab
        if (!json.equals(lastJsonString)) {
            System.out.println("CHANGED");
            try {
                lastJsonString = communicatorJSONString().toString();
                System.out.println(lastJsonString);
                json = lastJsonString;
                JsonObject jsonObject = new JsonParser().parse(json).getAsJsonObject();

                // Überprüfung und Verarbeitung von "keyInformation"
                try {
                    JsonObject keyInfo = jsonObject.get("keyInformation").getAsJsonObject();
                    IP = keyInfo.get("IP").getAsString();
                    apiKey = keyInfo.get("apiKey").getAsString();
                    activeLights = jsonObject.get("activeSyncs").getAsJsonObject();

                    // Überprüfung und Verarbeitung von "generalSettings"
                    JsonObject generalSettings = jsonObject.get("generalSettings").getAsJsonObject();
                    int maxDimmableBackgroundSync = generalSettings.get("maxDimmableBackgroundSync").getAsInt();
                    int minDimmableBackgroundSync = generalSettings.get("minDimmableBackgroundSync").getAsInt();
                    boolean automaticDimmableTurnOffBackgroundSync = generalSettings.get("AutomaticDimmableTurnOffBackgroundSync").getAsBoolean();
                    int luminanceTresholdForTurnOffBackgroundSync = generalSettings.get("luminanceTresholdForTurnOffBackgroundSync").getAsInt();
                    int dimmableMultiplierBackgroundSync = generalSettings.get("dimmableMultiplierBackgroundSync").getAsInt();
                    int minLuminanceChangeRate = generalSettings.get("minLuminanceChangeRate").getAsInt();
                    int minRGBChangeRate = generalSettings.get("minRGBChangeRate").getAsInt();

                    // Hier kannst du mit den extrahierten Werten weiterarbeiten oder Änderungen prüfen
                    System.out.println("General Settings Updated:");
                    System.out.println("maxDimmableBackgroundSync: " + maxDimmableBackgroundSync);
                    System.out.println("minDimmableBackgroundSync: " + minDimmableBackgroundSync);
                    System.out.println("AutomaticDimmableTurnOffBackgroundSync: " + automaticDimmableTurnOffBackgroundSync);
                    System.out.println("luminanceTresholdForTurnOffBackgroundSync: " + luminanceTresholdForTurnOffBackgroundSync);
                    System.out.println("dimmableMultiplierBackgroundSync: " + dimmableMultiplierBackgroundSync);
                    System.out.println("minLuminanceChangeRate: " + minLuminanceChangeRate);
                    System.out.println("minRGBChangeRate: " + minRGBChangeRate);
                    if (minDimmableBackgroundSync > maxDimmableBackgroundSync) {
                        int temp = minDimmableBackgroundSync;
                        minDimmableBackgroundSync = maxDimmableBackgroundSync;
                        maxDimmableBackgroundSync = temp;
                    }
                    DesktopSync.dimmMin = minDimmableBackgroundSync;
                    DesktopSync.dimmMax = maxDimmableBackgroundSync;
                    
                    DesktopSync.dimmableSensitivityMultiplier = dimmableMultiplierBackgroundSync;
                    
                    /*if (automaticDimmableTurnOffBackgroundSync) {
                        
                    } else {
                        
                    }*/ // NOT IMPLEMENTET YET
                    DesktopSync.sensitivityLuminance = minLuminanceChangeRate;
                    DesktopSync.sensitivityRGB = minRGBChangeRate;
                    
                    // Aktive Synchronisationen verarbeiten
                    ArrayList<String> activeSyncs = new ArrayList<>();
                    JsonObject activeSyncsObject = jsonObject.get("activeSyncs").getAsJsonObject();
                    JsonObject rgbLightsObject = activeSyncsObject.get("rgbLights").getAsJsonObject();
                    JsonObject dimmableLightsObject = activeSyncsObject.get("dimmableLights").getAsJsonObject();
                    Set<Map.Entry<String, JsonElement>> entries = rgbLightsObject.entrySet(); // will return members of your object
                    int index = -1;
                    for (int i = 0; i < 2; ++i) {
                        for (Map.Entry<String, JsonElement> entry : entries) {
                            System.out.println("AA   " + entry);
                            index++;
                            String key = entry.getKey();
                            JsonObject keyObj;
                            if (i == 0) {
                                keyObj = rgbLightsObject.get(key).getAsJsonObject();
                            } else {
                                keyObj = dimmableLightsObject.get(key).getAsJsonObject();
                            }
                            activeSyncs.add(key);
                            System.out.println(lastActiveSyncs);
                            if (lastActiveSyncs == null || !lastActiveSyncs.contains(key)) {
                                ambianceArray.add(new Ambiance());
                                ambianceArray.get(ambianceArray.size() - 1).register(toOriginal(key), keyObj.get("ambianceName").getAsString(), keyObj.get("objectKey").getAsInt(), i == 0 ? "rgb" : "dimmable"); // get new Ambiance object and register with type                   
                            } else {
                                String nowMode = keyObj.get("ambianceName").getAsString();
                                ambianceArray.get(index).changeTo(nowMode); // even if mode of object and readed mode is same ... --> check in class
                            }
                        }
                        entries = dimmableLightsObject.entrySet();
                    }

                    // Überprüfen, ob Syncs entfernt wurden
                    if (lastActiveSyncs != null && lastActiveSyncs.size() > activeSyncs.size()) {
                        for (int i = 0; i < lastActiveSyncs.size(); ++i) {
                            if (!activeSyncs.contains(lastActiveSyncs.get(i))) {
                                ambianceArray.get(i).delete();
                                ambianceArray.set(i, null);
                            }
                        }
                        int length = ambianceArray.size();
                        for (int i = 0; i < length; ++i) {
                            if (ambianceArray.get(i) == null) {
                                ambianceArray.remove(i);
                                i--;
                                length--;
                            }
                        }
                    }

                    lastActiveSyncs = activeSyncs;
                } catch (NullPointerException e) {
                    // kill program
                    System.exit(0);
                }
            } catch (Exception e) {
                //e.printStackTrace(); // should be nullpointer exception bc of too fast adjustment, but shouldn't bother thaat much
            }
        }
    }

    private static String toOriginal (String before) {
        return before.replaceAll("<COLON>",":");
    }

    public static String readFileAsString(String file)throws Exception
    {
        return new String(Files.readAllBytes(Paths.get(file)));
    }

    public static  HashMap<String, String> communicatorJSONString() throws FileNotFoundException
    {
        String path;
        FileReader fileR;
        if (mode.equals("packed")) {
            try {
                path = System.getProperty("user.dir")+"/jars/"+"communicator.json";
                fileR = new FileReader(path);
            } catch(FileNotFoundException e) {
                path = System.getProperty("user.dir")+"communicator.json";
                fileR = new FileReader(path);
            }
        } else {
            path = "../communicator.json";
            fileR = new FileReader(path);
        }
        BufferedReader bufferedReader = new BufferedReader(fileR);

        Gson gson = new Gson();
        HashMap<String, String> json = gson.fromJson(bufferedReader, HashMap.class);
        return json;
    }
}