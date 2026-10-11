---
title: CONVERT KEY 문
summary: late numbering 에서 임시 키를 넘겨 주고 최종 키를 받아 오는 EML 문입니다.
keywords: CONVERT KEY, CONVERT KEY OF, TEMPORARY, 최종 키, 임시 키, late numbering, 늦은 번호 부여, %pid, %pre, %tmp, COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, adjust_numbers
---

## 문법

```syntax
CONVERT KEY OF [bdef|(bdef)]
  FROM [TEMPORARY] pre_key
  TO final_key.
```

## 설명

late numbering 을 쓰는 RAP BO 에서는 인스턴스를 만들 때 임시 키만 있고, 최종 키는 save sequence(저장 순서)에 들어가서야 정해집니다. `CONVERT KEY` 는 임시 키(`pre_key`)를 넘겨 그 인스턴스의 **최종 키**(`final_key`)를 받아 오는 문입니다.

쓸 수 있는 자리는 두 곳입니다.

- **behavior implementation(동작 구현) 밖** : 트랜잭션을 맡은 쪽은 `COMMIT ENTITIES BEGIN` 과 `COMMIT ENTITIES END` 사이에서만 `CONVERT KEY` 를 쓸 수 있습니다.
- **behavior implementation 안** : saver method(세이버 메서드)에서 late numbering 을 쓰는 **다른 RAP BO** 의 최종 키를 알아낼 때 씁니다. 이때는 `COMMIT ENTITIES BEGIN ... END` 로 감싸지 않습니다. 보통 `save` 나 `save_modified` 메서드에서 씁니다.

`adjust_numbers` 안에서는 save sequence 에서 BO 들이 저장되는 차례가 보장될 때만 씁니다. 예를 들어 BO B 의 `adjust_numbers` 에서 BO A 의 키를 `CONVERT KEY` 로 바꾸려면, save sequence 에서 B 가 A 뒤에 와야 합니다. A 가 B 보다 먼저라는 점은 종속 BO 로 선언하거나 behavior definition(동작 정의)에 [[abenbdl_save_after|save after]] 를 적어서 분명히 해 둡니다.

각 부분의 뜻은 다음과 같습니다.

- `CONVERT KEY OF bdef` : 키를 바꿀 RAP BO entity(엔터티)입니다. 괄호 안에 넣어 `(bdef)` 처럼 동적으로 지정할 수도 있습니다. 이때 이름은 `ABP_ENTITY_NAME` 과 호환되어야 합니다. 다른 EML 문과 달리 이 문은 내부 테이블(여러 건)이 아니라 **값 하나씩**(`pre_key`, `final_key`)을 다룹니다.
- `FROM [TEMPORARY] pre_key` : 임시 키 값입니다. `pre_key` 의 타입은 [[abapderived_types_pid|%pid]] 와 호환되어야 합니다. `TEMPORARY` 를 붙이면 [[abapderived_types_pre|%pre]] 와 호환되어야 합니다. `TEMPORARY` 는 interaction phase(상호작용 단계)에서 임시 키를 `%pid` 대신 `%pre` 에 담는 late numbering 시나리오에서만 뜻이 있습니다.
- `TO final_key` : 최종 키 값을 받을 자리입니다. 타입은 기본 키의 타입과 호환되어야 합니다. `TYPE STRUCTURE FOR KEY` 타입의 구조를 쓸 수 있고, entity 를 동적으로 지정할 때 특히 쓸모가 있습니다([[abaptype_structure_for]]).

late numbering 에서 `%pid`, `%pre`, `%key` 를 어떻게 쓰는지는 [[abapderived_types_keys_identifiers]] 에 정리되어 있습니다.

## 예제

late numbering 을 쓰는 여행 BO 에 인스턴스를 만들고, 저장하는 도중에 최종 여행 번호를 받아 옵니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( agencyid customerid )
  WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000010' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES BEGIN.

  LOOP AT ls_mapped-travel ASSIGNING FIELD-SYMBOL(<ls_mapped>).
    " 임시 ID(%pid)를 넘기고 최종 키를 받는다
    CONVERT KEY OF zr_travel
      FROM <ls_mapped>-%pid
      TO DATA(ls_final_key).
  ENDLOOP.

COMMIT ENTITIES END.
```

임시 키를 `%pre` 로 다루는 경우에는 `TEMPORARY` 를 붙이고, `%pid` 와 `%tmp` 를 묶은 값을 넘깁니다.

```abap
COMMIT ENTITIES BEGIN
  RESPONSES FAILED DATA(ls_failed_late)
            REPORTED DATA(ls_reported_late).

  LOOP AT ls_mapped-travel ASSIGNING FIELD-SYMBOL(<ls_early>).
    CONVERT KEY OF zr_travel
      FROM TEMPORARY VALUE #( %pid = <ls_early>-%pid
                              %tmp = <ls_early>-%key )
      TO DATA(ls_key).
  ENDLOOP.

COMMIT ENTITIES END.
```

## 알아두기

- 한 번에 키 하나만 바꾸므로, 여러 인스턴스의 최종 키가 필요하면 예제처럼 `mapped` 의 줄을 돌면서 부릅니다.
- SAP 예제 클래스 `CL_DEMO_RAP_EML_COMMIT_3` 은 `COMMIT ENTITIES BEGIN ... END` 안에서 `CONVERT KEY OF` 를 쓰는 모습을, `CL_DEMO_RAP_DRVD_TYPES_LATENU2` 는 여기에 `TEMPORARY` 를 붙인 모습을 보여 줍니다.

## 관련 항목

- [[abapcommit_entities]]
- [[abapemlcommit_entities_late]]
- [[abenbdl_late_numbering]]
- [[abensaver_adjust_numbers]]
- [[abapderived_types_pid]]
- [[abapderived_types_pre]]
- [[abapderived_types_tmp]]
- [[abencommit_entities_beginend_abexa]]
- [[abenderived_types_pre_tmp_abexa]]
