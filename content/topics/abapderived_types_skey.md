---
title: %skey (대체 키 묶음)
summary: key function 의 입력에서 %param 안에 들어 있는 구성요소 묶음으로, behavior definition 에 적은 순수 키나 보조 키의 필드를 담습니다.
keywords: %skey, %param, key function, 키 함수, pure key, secondary key, 순수 키, 보조 키, 대체 키, FUNCTION IMPORT, EXECUTE
---

## 설명

`%skey` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**입니다. [[abapderived_types_param|%param]] 의 구성요소로 들어 있고, [[abenbdl_keyfunction|key function]] 을 쓸 때 나옵니다.

`%skey` 에는 behavior definition(동작 정의, BDEF)에 적은 **BDEF 순수 키**(pure key)나 **BDEF 보조 키**(secondary key)가 들어 있습니다. key function 을 부를 때 찾을 값을 여기에 넣습니다.

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `FUNCTION IMPORT` (key function)

## 예제

여행사 번호를 순수 키로 정하고, 그 키로 여행을 찾는 key function 을 선언합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  define pure key ByAgency { AgencyID; }

  key ( ByAgency ) function getByAgency result selective [0..*] $self;
}
```

key function 을 부릅니다. `%skey` 를 드러내 적는 것은 선택 사항이어서, 아래 두 줄은 같은 자리를 채웁니다.

```abap
DATA lt_import TYPE TABLE FOR FUNCTION IMPORT zr_travel~getbyagency.

lt_import = VALUE #( ( %cid = 'cid1' %param-%skey-agencyid = '070001' )   " %skey 를 적는다
                     ( %cid = 'cid2' %param-agencyid       = '070002' ) ). " %skey 를 생략한다

READ ENTITY zr_travel
  EXECUTE getbyagency FROM lt_import
  RESULT DATA(lt_result)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- `%skey` 를 적지 않고 `%param-필드이름` 으로 바로 적어도 됩니다.
- 원문 예제에서는 키가 필드 하나뿐이어서, `%param-%skey = 'X'` 나 `%param = 'Z'` 처럼 필드 이름 없이 값을 바로 넣는 모습도 보여 줍니다.

## 관련 항목

- [[abenbdl_keyfunction]]
- [[abapderived_types_param]]
- [[abapderived_types_keys_id]]
- [[abenbdl_function]]
