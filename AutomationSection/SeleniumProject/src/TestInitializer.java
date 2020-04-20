import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;



public class TestInitializer {
	
	public static void main(String[] args) {
		System.setProperty("webdriver.chrome.driver","C:\\Program Files\\Java\\ChromeDriver\\chromedriver.exe");
		
		WebDriver driver = new ChromeDriver();
		
		driver.get("http://mauriciprats.github.io");
		
		/*Xpaths Format*/
		//Basic:  //tagname[@attribute='value'] -> for example //a[@href='#works-card']
		//Regular Expression: //tagname[contains(@attribute,'value')] -> Checks if the attribute contains the value
		
		/*CSS Format*/
		//Basic: tagname[attribute='value'] -> for example a[href='#works-card']
		//Regular Expression: tagname[attribute*='value']
		
		driver.findElement(By.xpath("//a[@href='#works-card']")).click(); //xpath
		
		System.out.print(driver.findElement(By.xpath("//a[contains(@href,'AutomationSection')]")).getSize().toString());
		
		driver.findElement(By.cssSelector("a[href='#contacts-card']")).click(); //css
	}
}
