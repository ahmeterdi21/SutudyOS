# StudyOS v0.4.1

## Türkçe

Uygulamanın kapanmasını engelleyen pencere izni düzeltildi. Sağ üstteki kapat düğmesi, Alt+F4 ve Windows kapatma istekleri aynı kayıt korumalı akışı kullanır. Bekleyen kayıtlar tamamlandıktan sonra pencere kapanır; kayıt başarısızsa açık kalır.

## English

Fixed the missing window-destruction permission that prevented StudyOS from closing. The custom close button, Alt+F4 and Windows close requests share the save-protected close flow. The window closes after pending writes complete and stays open if saving fails.

Validation / Doğrulama: frontend production build, Windows development build, 35 application tests and 3 release-configuration tests passed. The custom close button and Alt+F4 were verified in the native development app; records remained available after relaunch.
