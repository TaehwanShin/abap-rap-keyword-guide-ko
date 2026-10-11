---
title: BDEF extension 의 extensibility (extension 겹치기)
summary: BDEF extension 을 다른 BDEF extension 으로 다시 확장하려면 그 BDEF extension 도 extension 을 명시적으로 허용해야 하며, 이 갈래는 extension 종류별로 그 방법을 다룹니다.
keywords: extension layering, 확장 겹치기, 확장의 확장, extensible, BDEF extension, BDEF 확장, 확장 허용, base BDEF extension, projection BDEF extension, abstract BDEF extension, 확장 지점
---

## 설명

BDEF extension(확장)을 또 다른 BDEF extension 으로 확장할 수 있습니다. 이것을 **extension 겹치기**(extension layering)라고 합니다. extension 위에 extension 을 한 겹 더 올리는 셈입니다.

그러려면 아래쪽 BDEF extension 이 **extension 을 명시적으로 허용**해야 합니다. 원래 behavior definition(동작 정의)와 마찬가지로 기술 요건을 갖추고, 어디에 무엇을 덧붙일 수 있는지 extension 지점을 정해 두어야 합니다. 허용은 여기서도 키워드 `extensible` 로 합니다.

방법은 BDEF extension 의 종류에 따라 다릅니다.

- [[abenbdl_ext_enabl_ext_base]] : base BDEF(기반 BDEF) extension(managed·unmanaged BO 의 extension)에서 extension 을 허용하는 방법
- [[abenbdl_ext_enabl_ext_proj]] : projection BDEF extension 에서 extension 을 허용하는 방법
- [[abenbdl_ext_enabl_ext_abs]] : abstract BDEF extension 에서 extension 을 허용하는 방법

extension 겹치기에 두루 적용되는 규칙은 [[abenbdl_extension_layering]] 에 있습니다.

## 관련 항목

- [[abenbdl_extensibility_enabling]]
- [[abenbdl_extension_layering]]
- [[abenbdl_extension]]
- [[abenbdl_extensible]]
