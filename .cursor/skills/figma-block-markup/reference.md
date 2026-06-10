# Справочник: Swiper и UIkit

## Swiper

Эталон для проекта (Swiper 8). Имя блока (`hero`) замени на своё.

```html
<section class="hero">
    <div class="hero__slider swiper">
        <div class="swiper-wrapper">
            <div class="hero__slide swiper-slide">
                <div class="hero__media">
                    <img class="hero__img" src="static/hero-slide-1.jpg">
                    <div class="hero__gradient hero__gradient--top"></div>
                    <div class="hero__gradient hero__gradient--bottom"></div>
                </div>
                <div class="hero__inner">
                    <div class="hero__body">
                        <h1 class="hero__title">Заголовок</h1>
                        <div class="hero__subhead">
                            <p class="hero__subhead-line">Строка</p>
                        </div>
                    </div>
                    <a class="hero__link" href="#">Ссылка</a>
                </div>
            </div>
        </div>
        <div class="hero__pagination swiper-pagination"></div>
    </div>
</section>
```

Обязательные классы Swiper (не переименовывать): `swiper`, `swiper-wrapper`, `swiper-slide`, `swiper-pagination`, при необходимости `swiper-button-prev`, `swiper-button-next`.

Инициализация Swiper — в `src/js/`, не в этом скилле.

## UIkit

Документация: https://getuikit.com/docs/introduction

| Паттерн в макете | Раздел доки |
|------------------|-------------|
| Модальное окно | https://getuikit.com/docs/modal |
| Выпадающее меню | https://getuikit.com/docs/dropdown |
| Аккордеон | https://getuikit.com/docs/accordion |
| Табы | https://getuikit.com/docs/tab |
| Оффканвас / боковая панель | https://getuikit.com/docs/offcanvas |
| Слайдер UIkit (не Swiper) | https://getuikit.com/docs/slider |
| Переключатель / toggle | https://getuikit.com/docs/toggle |
| Уведомление | https://getuikit.com/docs/notification |

Алгоритм: открой раздел, скопируй HTML из примера, оберни в БЭМ-классы блока, сохрани `uk-*` и `data-uk-*` из документации.
