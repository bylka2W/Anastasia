using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;

class Installer
{
    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new InstallForm());
    }
}

class InstallForm : Form
{
    Label status;
    Button btnInstall;

    static string target = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
        "Anastasia"
    );

    public InstallForm()
    {
        Text = "Anastasia Installer";
        Size = new Size(420, 320);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        BackColor = Color.FromArgb(13, 13, 13);

        var heart = new Label();
        heart.Text = "\u2661";
        heart.Font = new Font("Segoe UI", 48f);
        heart.ForeColor = Color.FromArgb(255, 0, 127);
        heart.AutoSize = true;
        heart.Location = new Point(170, 10);
        Controls.Add(heart);

        var title = new Label();
        title.Text = "Anastasia";
        title.Font = new Font("Segoe UI", 20f, FontStyle.Bold);
        title.ForeColor = Color.FromArgb(255, 0, 127);
        title.AutoSize = true;
        title.Location = new Point(145, 80);
        Controls.Add(title);

        var info = new Label();
        info.Text = "Extension for Google Chrome";
        info.Font = new Font("Segoe UI", 10f);
        info.ForeColor = Color.Gray;
        info.AutoSize = true;
        info.Location = new Point(128, 115);
        Controls.Add(info);

        btnInstall = new Button();
        btnInstall.Text = "Install";
        btnInstall.Font = new Font("Segoe UI", 12f, FontStyle.Bold);
        btnInstall.BackColor = Color.FromArgb(255, 0, 127);
        btnInstall.ForeColor = Color.White;
        btnInstall.FlatStyle = FlatStyle.Flat;
        btnInstall.Size = new Size(200, 45);
        btnInstall.Location = new Point(100, 160);
        btnInstall.Cursor = Cursors.Hand;
        btnInstall.Click += DoInstall;
        Controls.Add(btnInstall);

        status = new Label();
        status.Text = "";
        status.Font = new Font("Segoe UI", 9f);
        status.ForeColor = Color.FromArgb(200, 200, 200);
        status.AutoSize = true;
        status.Location = new Point(30, 225);
        Controls.Add(status);
    }

    void DoInstall(object s, EventArgs e)
    {
        try
        {
            string source = Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().Location
            );

            if (!Directory.Exists(target))
                Directory.CreateDirectory(target);

            string[] files = { "content.js", "interceptor.js", "manifest.json", "style.css", "icon.png" };
            foreach (string f in files)
            {
                string src = Path.Combine(source, f);
                if (File.Exists(src))
                    File.Copy(src, Path.Combine(target, f), true);
            }

            status.ForeColor = Color.LimeGreen;
            status.Text = "Done! Extension installed.";

            try
            {
                // Kill Chrome so --load-extension flag works
                foreach (var p in Process.GetProcessesByName("chrome"))
                {
                    try { p.Kill(); p.WaitForExit(3000); } catch { }
                }
            }
            catch { }

            System.Threading.Thread.Sleep(1000);

            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "cmd",
                    Arguments = "/c start chrome --load-extension=\"" + target + "\" https://chat.deepseek.com",
                    UseShellExecute = true,
                    CreateNoWindow = true
                });
            }
            catch
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "chrome.exe",
                        Arguments = "--load-extension=\"" + target + "\" https://chat.deepseek.com",
                        UseShellExecute = true
                    });
                }
                catch
                {
                    status.Text = "Done! Open chrome://extensions and load: " + target;
                }
            }

            btnInstall.Text = "Done!";
            btnInstall.BackColor = Color.FromArgb(40, 167, 69);
        }
        catch (Exception ex)
        {
            status.ForeColor = Color.Red;
            status.Text = "Error: " + ex.Message;
        }
    }
}
