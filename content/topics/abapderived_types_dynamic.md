---
title: BDEF derived type 을 동적으로 쓰기
summary: RTTS 의 GET_BDEF_DERIVED_TYPE 메서드로 실행 중에 BDEF derived type 의 타입 설명 객체를 얻어, 그 타입의 데이터 객체를 만들 수 있습니다.
keywords: GET_BDEF_DERIVED_TYPE, CL_ABAP_TABLEDESCR, CL_ABAP_STRUCTDESCR, ABP_BDEF_DERIVED_TYPE, RTTS, 동적 타입 생성, p_entity, p_kind, p_sub_name, CX_SY_BDEF_DERIVED_TYPE_ERROR, 절대 타입 이름
---

## 설명

RTTS(Runtime Type Services, 실행 중에 타입 정보를 다루는 클래스 모음)를 쓰면 BDEF derived type(BDEF 파생 타입)을 실행 중에 동적으로 만들 수 있습니다. 이렇게 만들어도 타입 안전성은 그대로입니다.

BDEF derived type 은 테이블 타입이거나 구조 타입입니다. 그래서 두 클래스에 같은 이름의 메서드가 하나씩 있습니다.

- `CL_ABAP_TABLEDESCR=>GET_BDEF_DERIVED_TYPE` : 테이블 타입
- `CL_ABAP_STRUCTDESCR=>GET_BDEF_DERIVED_TYPE` : 구조 타입

메서드는 BDEF derived type 의 **타입 설명 객체**를 가리키는 참조를 돌려줍니다. 이 객체로 이름 없는 데이터 객체를 만들 수 있습니다(`CREATE DATA ... TYPE HANDLE`).

넘기는 매개변수는 세 개입니다.

| 매개변수 | 내용 |
| --- | --- |
| `p_entity` | entity(엔터티) 이름입니다. |
| `p_kind` | 어떤 종류의 derived type 인지 정합니다. 타입은 열거형 `ABP_BDEF_DERIVED_TYPE` 이라 정해진 값만 넣을 수 있습니다. 예를 들어 생성 작업용 타입은 `ABP_BDEF_DERIVED_TYPE-CREATE` 입니다. |
| `p_sub_name` | association, action, function 같은 entity 요소의 이름입니다. |

`p_kind` 로 고를 수 있는 것은 BDEF derived type 전부가 아니라 추려 놓은 일부입니다. 주로 RAP BO consumer(사용자)에게 필요한 타입들입니다.

### 절대 타입 이름

BDEF derived type 의 절대 타입 이름에는 정해진 모양이 있습니다. 이 이름으로도 데이터 객체를 만들 수 있습니다(`CREATE DATA ... TYPE (이름)`).

| 타입 | 절대 타입 이름 |
| --- | --- |
| `TYPE TABLE FOR CREATE` | `\BDEF=BDEF_NAME\ENTITY=ENTITY_NAME\TYPE=CREATE` |
| `TYPE STRUCTURE FOR UPDATE` | `\BDEF=BDEF_NAME\ENTITY=ENTITY_NAME\TYPE=UPDATE\LINE` |
| `TYPE TABLE FOR ACTION IMPORT bdef_name~act` | `\BDEF=BDEF_NAME\ENTITY=ENTITY_NAME\ACTION=ACT\TYPE=IMPORTING` |

## 예제

여행 entity 의 derived type 세 가지를 실행 중에 만들어 봅니다.

```abap
CONSTANTS lc_entity TYPE string VALUE `ZR_TRAVEL`.

DATA lr_create TYPE REF TO data.
DATA lr_by_name TYPE REF TO data.

TRY.
    " TYPE TABLE FOR CREATE zr_travel 과 같은 테이블 타입
    FINAL(lo_create) = cl_abap_tabledescr=>get_bdef_derived_type(
                         p_entity = lc_entity
                         p_kind   = abp_bdef_derived_type-create ).

    " 타입 설명 객체로 데이터 객체를 만든다
    CREATE DATA lr_create TYPE HANDLE lo_create.

    " 절대 타입 이름으로도 만들 수 있다
    " lv_name = \BDEF=ZR_TRAVEL\ENTITY=ZR_TRAVEL\TYPE=CREATE
    FINAL(lv_name) = lo_create->absolute_name.
    CREATE DATA lr_by_name TYPE (lv_name).

    " TYPE STRUCTURE FOR UPDATE zr_travel 과 같은 구조 타입
    FINAL(lo_update) = cl_abap_structdescr=>get_bdef_derived_type(
                         p_entity = lc_entity
                         p_kind   = abp_bdef_derived_type-update ).

    " action 의 입력 타입: action 이름을 p_sub_name 으로 넘긴다
    FINAL(lo_action) = cl_abap_tabledescr=>get_bdef_derived_type(
                         p_entity   = lc_entity
                         p_kind     = abp_bdef_derived_type-action_function_import
                         p_sub_name = `acceptTravel` ).

    " association 으로 만들기 타입: association 이름이 꼭 있어야 한다
    FINAL(lo_cba) = cl_abap_tabledescr=>get_bdef_derived_type(
                      p_entity   = lc_entity
                      p_kind     = abp_bdef_derived_type-cba
                      p_sub_name = `_Booking` ).

  CATCH cx_sy_rtti_syntax_error
        cx_sy_bdef_derived_type_error
        cx_sy_rtti_type_not_released INTO DATA(lx_error).
    " 타입을 만들지 못했다
ENDTRY.
```

## 알아두기

- 구조 타입으로만 있는 BDEF derived type 이 있습니다. 이런 타입은 `CL_ABAP_TABLEDESCR` 로 만들 수 없습니다. 원문 예제에서는 `ABP_BDEF_DERIVED_TYPE-PERMISSIONS_REQUEST` 를 테이블 타입으로 만들려다 예외가 납니다.
- [[abapderived_types_data|%data]] 와 [[abapderived_types_control|%control]] 은 BDEF derived type 의 하위 타입입니다. 따로 정해진 BDEF derived type 이름이 없어서, 절대 타입 이름이 기술적인 이름으로 나옵니다.
- 메서드를 부를 때는 다음 예외를 잡아야 합니다.
  - `CX_SY_RTTI_SYNTAX_ERROR` : 문법 오류가 있을 때
  - `CX_SY_BDEF_DERIVED_TYPE_ERROR` : 조회가 잘못됐을 때. 예를 들어 꼭 필요한 요소 이름(`p_sub_name`)을 넘기지 않았거나, 넘긴 이름의 요소가 없을 때
  - `CX_SY_RTTI_TYPE_NOT_RELEASED` : 릴리스되지 않은 타입일 때

## 관련 항목

- [[abenrpm_derived_types]]
- [[abapderived_types_declaration]]
- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abapderived_types_data]]
- [[abapderived_types_control]]
