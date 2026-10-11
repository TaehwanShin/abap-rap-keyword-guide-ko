---
title: action·function 매개변수 (%param)
summary: action 과 function 의 결과를 담는 구성요소입니다. draft action edit 에서는 기존 draft 를 지킬지 정하는 preserve_changes 가 들어 있습니다.
keywords: %param, 액션 결과, 함수 결과, result, ACTION IMPORT, ACTION RESULT, FUNCTION IMPORT, FUNCTION RESULT, preserve_changes, ABP_BEHV_PAR_EDIT, edit, 초안 액션, %skey, REQUEST
---

## 설명

`%param` 은 BDEF derived type(BDEF 파생 타입)에 들어 있는 구조형 구성요소입니다. action([[abenbdl_action]])과 function([[abenbdl_function]])를 구현할 때 결과 매개변수([[abapeml_result]])에서 씁니다.

- BDEF 에 결과를 정의했다면, action·function 구현에서 `%param` 을 **반드시 채워야** 합니다.
- 선택적 결과(selective result)를 쓰는 action·function 이라면 `REQUEST` 로 요청받은 필드만 채우면 됩니다.

### draft action edit 의 preserve_changes

draft action `edit`([[abenbdl_draft_action]])에서는 `%param` 에 `preserve_changes` 라는 구성요소가 있습니다. 참·거짓 값입니다.

- 참 : 이미 draft 가 있으면 draft action 요청을 거절합니다.
- 거짓(기본값) : `edit` 를 실행합니다. active(활성) 인스턴스를 draft 테이블로 복사하면서, 있던 draft 를 active 데이터 값으로 덮어씁니다. 있던 draft 에서 고치고 있던 내용은 사라집니다.

### 타입

- BDEF 에서 매개변수를 어떻게 적었느냐에 따라 달라집니다. `%data` 와 `%key` / `%tky` / `%pky` 로 이루어진 구조일 수 있고, 상황에 따라 `%pid` 같은 다른 `%` 구성요소가 붙습니다. static action·function 에서는 BDEF 에 적은 DDIC 타입일 수도 있습니다.
- draft action `edit` 에서는 `ABP_BEHV_PAR_EDIT` 타입입니다.
- RAP key function 에서 `FUNCTION IMPORT` derived type 을 쓸 때는 `%param` 안에 [[abapderived_types_skey]] 가 들어 있습니다.

### 쓰이는 곳

[[abaptype_table_for]] 와 [[abaptype_structure_for]] 선언 가운데 다음 타입에 나옵니다.

- `ACTION IMPORT`
- `ACTION RESULT`
- `FUNCTION IMPORT`
- `FUNCTION RESULT`

## 예제

결과가 `$self` 인 action 에서, 바뀐 여행을 다시 읽어 `%param` 에 넣어 돌려줍니다.

```abap
METHOD accepttravel.
  MODIFY ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'A' ) )
    FAILED failed
    REPORTED reported.

  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      ALL FIELDS WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 결과를 정의했으므로 %param 을 채운다
  result = VALUE #( FOR ls_travel IN lt_travel
                    ( %tky = ls_travel-%tky %param = ls_travel ) ).
ENDMETHOD.
```

draft action `edit` 를 실행하면서 `preserve_changes` 를 넘깁니다. 참으로 넘겼으므로, 이 여행에 이미 draft 가 있으면 요청이 거절됩니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE edit FROM VALUE #(
      ( %key-travelid           = '00000001'
        %param-preserve_changes = abap_true ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 알아두기

- `preserve_changes` 를 넘기지 않으면 거짓으로 처리됩니다. 이때 `edit` 는 있던 draft 를 덮어쓰므로, 그 draft 에서 고치던 내용이 사라집니다.

## 관련 항목

- [[abenbdl_action]]
- [[abenbdl_function]]
- [[abenbdl_draft_action]]
- [[abapeml_result]]
- [[abapderived_types_data]]
- [[abapderived_types_skey]]
- [[abapderived_types_tky]]
- [[abenderived_types_tky_abexa]]
