# Site Comparison Tool - Eclipse Setup Guide

This guide provides step-by-step instructions to set up and run the Site Comparison Tool in Eclipse IDE.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Eclipse Installation](#eclipse-installation)
3. [Importing the Project](#importing-the-project)
4. [Maven Configuration](#maven-configuration)
5. [Project Configuration](#project-configuration)
6. [Running the Project](#running-the-project)
7. [Understanding the Output](#understanding-the-output)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

### 1. Java Development Kit (JDK)
- **Required Version**: JDK 8 or higher (JDK 11+ recommended)
- **How to Check**: Open Command Prompt/PowerShell and run:
  ```bash
  java -version
  javac -version
  ```
- **Download**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)

### 2. Eclipse IDE
- **Required Version**: Eclipse IDE for Java Developers (2021-06 or later)
- **Download**: [Eclipse Downloads](https://www.eclipse.org/downloads/)
- **Recommended**: Eclipse IDE for Enterprise Java and Web Developers

### 3. Maven
- **Required Version**: Maven 3.6.3 or higher
- **How to Check**: Open Command Prompt/PowerShell and run:
  ```bash
  mvn -version
  ```
- **Note**: Eclipse usually comes with Maven integration, but you can install standalone Maven if needed
- **Download**: [Apache Maven](https://maven.apache.org/download.cgi)

### 4. Google Chrome Browser
- The project uses ChromeDriver for web automation
- **Download**: [Google Chrome](https://www.google.com/chrome/)
- **Note**: WebDriverManager will automatically download the appropriate ChromeDriver version

---

## Eclipse Installation

### Step 1: Download and Install Eclipse

1. Visit [Eclipse Downloads](https://www.eclipse.org/downloads/)
2. Download **Eclipse IDE for Enterprise Java and Web Developers** (recommended) or **Eclipse IDE for Java Developers**
3. Extract the downloaded ZIP file to a location of your choice (e.g., `C:\eclipse`)
4. Run `eclipse.exe` from the extracted folder
5. Choose a workspace directory when prompted (e.g., `C:\Users\YourName\eclipse-workspace`)

### Step 2: Install Maven Plugin (if not included)

1. Open Eclipse
2. Go to **Help** → **Eclipse Marketplace**
3. Search for "Maven Integration for Eclipse" or "m2e"
4. Click **Install** if not already installed
5. Restart Eclipse after installation

---

## Importing the Project

### Step 1: Open Eclipse and Prepare Workspace

1. Launch Eclipse IDE
2. If prompted, select or create a workspace directory
3. Close the welcome screen if it appears

### Step 2: Import Maven Project

1. Go to **File** → **Import...**
2. In the Import wizard, expand **Maven** folder
3. Select **Existing Maven Projects**
4. Click **Next**

### Step 3: Select Project Directory

1. Click **Browse...** next to "Root Directory"
2. Navigate to your project folder: `C:\Users\Yogesh\Downloads\fpd`
3. Select the folder and click **OK**
4. Eclipse should detect the `pom.xml` file
5. Ensure the checkbox next to the project is selected
6. Click **Finish**

### Step 4: Wait for Maven Build

1. Eclipse will automatically start downloading dependencies from Maven repositories
2. You can see the progress in the bottom-right corner or in the **Progress** view
3. This may take a few minutes on first import
4. Wait until the build completes (no errors in the **Problems** view)

---

## Maven Configuration

### Step 1: Verify Maven Settings

1. Go to **Window** → **Preferences** (or **Eclipse** → **Preferences** on Mac)
2. Navigate to **Maven** → **User Settings**
3. Verify the **User Settings** path points to your Maven settings file
4. Click **Apply and Close**

### Step 2: Update Maven Project (if needed)

1. Right-click on the project in **Package Explorer**
2. Select **Maven** → **Update Project...**
3. Ensure your project is selected
4. Check **Force Update of Snapshots/Releases** (optional)
5. Click **OK**

### Step 3: Verify Dependencies

1. Expand your project in **Package Explorer**
2. Navigate to **Maven Dependencies** under the project
3. You should see the following dependencies:
   - `selenium-java` (4.18.0)
   - `webdrivermanager` (5.6.2)
   - `jsoup` (1.17.2)
   - `poi` (5.2.5)
   - `poi-ooxml` (5.2.5)
   - `xmlbeans` (5.1.1)

If dependencies are missing:
1. Right-click project → **Maven** → **Reload Projects**
2. Or run: Right-click project → **Run As** → **Maven build...** → Enter goal: `clean install`

---

## Project Configuration

### Step 1: Configure Properties File

1. Navigate to `src/main/resources/fpd.properties` in **Package Explorer**
2. Double-click to open the file
3. Review and update the following properties as needed:

```properties
# Site A Configuration
siteA.base.url=https://danaher-kentico12.qc.seb-admin.com
siteA.login.url=/App/login?lang=en-us
siteA.username=227947
siteA.password=Test@123

# Site B Configuration
siteB.base.url=https://danaher.qc.seb-admin.com
siteB.login.url=/App/login
siteB.username=227947
siteB.password=Test@1234

# Output Directory
output.dir=./Output/

# URL Pairs for Comparison
siteB.url1=/App/fr-ca/app/home
siteA.url1=/App/home?lang=fr-ca
# ... (add more pairs as needed)
```

4. **Important**: Update the credentials and URLs according to your environment
5. Save the file (**Ctrl+S** or **File** → **Save**)

### Step 2: Verify Source Code Structure

Ensure your project structure looks like this:

```
fpd/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── fpd/
│   │   │   │   └── SiteComparer.java
│   │   │   └── util/
│   │   │       ├── DiffMatchPatch.java
│   │   │       ├── PropertiesUtil.java
│   │   │       └── URLPair.java
│   │   └── resources/
│   │       └── fpd.properties
│   └── test/
└── target/
```

---

## Running the Project

### Method 1: Run as Java Application (Recommended)

1. Navigate to **Package Explorer**
2. Expand `src/main/java` → `fpd`
3. Right-click on `SiteComparer.java`
4. Select **Run As** → **Java Application**
5. The application will start executing

### Method 2: Run with Run Configuration

1. Right-click on `SiteComparer.java`
2. Select **Run As** → **Run Configurations...**
3. In the left panel, select **Java Application**
4. Click the **New launch configuration** icon (top-left)
5. Configure:
   - **Name**: SiteComparer
   - **Project**: fpd (should be auto-selected)
   - **Main class**: `fpd.SiteComparer` (click **Search...** if needed)
6. Go to **Arguments** tab (optional):
   - Add program arguments if needed
7. Go to **JRE** tab:
   - Ensure correct JRE is selected
8. Click **Apply** then **Run**

### Method 3: Run from Console

1. Open **Window** → **Show View** → **Console** (if not visible)
2. Run the application using Method 1 or 2
3. Monitor the console output for:
   - Login progress
   - URL comparison status
   - File generation confirmations

### What Happens During Execution

1. **ChromeDriver Setup**: WebDriverManager automatically downloads and sets up ChromeDriver
2. **Browser Launch**: Two Chrome browser windows will open (one for each site)
3. **Login Process**: 
   - Logs into Site A
   - Logs into Site B
4. **Comparison**: For each URL pair:
   - Navigates to both URLs
   - Extracts text content
   - Generates diff HTML files
5. **Output**: Creates timestamped folder in `Output/` directory with HTML diff files

---

## Understanding the Output

### Output Location

- **Directory**: `./Output/output_YYYYMMDD_HHMMSS/`
- **Example**: `./Output/output_20260310_210933/`

### Output Files

Each URL pair comparison generates an HTML file:
- **Naming Pattern**: `diff__[SiteA_URL]_VS__[SiteB_URL].html`
- **Example**: `diff__App_homelangfr-ca_VS__App_fr-ca_app_home.html`

### HTML Diff Format

The generated HTML files contain:
- **Header**: Shows the compared URLs
- **Diff Content**: 
  - **Green text**: Content only in Site A
  - **Red text**: Content only in Site B
  - **Black text**: Common content

### Viewing Results

1. Navigate to the `Output` folder in your project directory
2. Open the timestamped subfolder
3. Open any HTML file in a web browser to view the differences

---

## Troubleshooting

### Issue 1: "Maven Dependencies Not Found"

**Symptoms**: Red error markers in code, missing imports

**Solutions**:
1. Right-click project → **Maven** → **Update Project...** → Check **Force Update** → **OK**
2. Right-click project → **Maven** → **Reload Projects**
3. Clean and rebuild: **Project** → **Clean...** → Select project → **Clean**

### Issue 2: "ChromeDriver Not Found" or Browser Issues

**Symptoms**: WebDriverException, browser doesn't open

**Solutions**:
1. Ensure Google Chrome is installed and up to date
2. Check internet connection (WebDriverManager downloads ChromeDriver)
3. If behind proxy, configure Maven proxy settings
4. Manually download ChromeDriver and add to PATH (if needed)

### Issue 3: "FileNotFoundException" for Output Directory

**Symptoms**: Error creating output files

**Solutions**:
1. Ensure you have write permissions in the project directory
2. Check that `output.dir` in `fpd.properties` is correctly set
3. The code should auto-create directories, but verify the path is valid

### Issue 4: "Login Failed" or "Element Not Found"

**Symptoms**: Selenium exceptions during login

**Solutions**:
1. Verify credentials in `fpd.properties`
2. Check if website structure has changed (selectors may need updating)
3. Increase wait times in code if pages load slowly
4. Verify network connectivity to the sites

### Issue 5: "Build Path Errors"

**Symptoms**: Project shows errors, won't compile

**Solutions**:
1. Right-click project → **Build Path** → **Configure Build Path**
2. Go to **Libraries** tab
3. Remove any broken classpath entries
4. Click **Add Library...** → **JRE System Library** → Select your JRE
5. Click **Apply and Close**

### Issue 6: "Java Version Mismatch"

**Symptoms**: Compilation errors, version warnings

**Solutions**:
1. Right-click project → **Properties**
2. Go to **Java Build Path** → **Libraries**
3. Remove old JRE, add correct one
4. Go to **Java Compiler** → Set **Compiler compliance level** to match your JDK

### Issue 7: Eclipse Not Recognizing Maven Project

**Symptoms**: Project doesn't show Maven structure

**Solutions**:
1. Right-click project → **Configure** → **Convert to Maven Project**
2. Or delete project from Eclipse (don't delete files), then re-import

### Issue 8: Slow Performance or Timeouts

**Symptoms**: Application runs slowly or times out

**Solutions**:
1. Increase `Thread.sleep()` values in code if pages load slowly
2. Check network speed
3. Close unnecessary browser tabs
4. Consider running comparisons in smaller batches

---

## Additional Tips

### Running Specific URL Pairs

To test with fewer URLs:
1. Comment out unwanted URL pairs in `fpd.properties`
2. Or modify the code to filter specific pairs

### Debugging

1. Set breakpoints in `SiteComparer.java`
2. Right-click → **Debug As** → **Java Application**
3. Use **F5** (Step Into), **F6** (Step Over), **F7** (Step Return), **F8** (Resume)

### Logging

Monitor the Eclipse Console for:
- Login status messages
- URL comparison progress
- File generation confirmations
- Any error messages

### Performance Optimization

- Close browser windows manually if the application crashes
- Use headless mode (modify code to add Chrome options) for faster execution
- Process URL pairs in parallel (requires code modification)

---

## Quick Reference

### Essential Eclipse Shortcuts

- **Ctrl+Shift+O**: Organize imports
- **Ctrl+Space**: Content assist
- **Ctrl+F11**: Run last application
- **F11**: Debug last application
- **Ctrl+Shift+F**: Format code
- **Alt+Shift+R**: Rename (refactoring)

### Project Files to Know

- `pom.xml`: Maven configuration and dependencies
- `fpd.properties`: Application configuration
- `SiteComparer.java`: Main application class
- `Output/`: Generated comparison results

---

## Support

If you encounter issues not covered in this guide:

1. Check Eclipse error logs: **Window** → **Show View** → **Error Log**
2. Review console output for detailed error messages
3. Verify all prerequisites are correctly installed
4. Ensure project structure matches the expected format

---

## Version Information

- **Project**: Site Comparison Tool
- **Java Version**: JDK 8+
- **Maven**: 3.6.3+
- **Selenium**: 4.18.0
- **Eclipse**: 2021-06 or later

---

**Last Updated**: March 2024
