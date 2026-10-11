---
title: saver method 예제 모음
summary: saver method 가 save sequence 에서 언제 불리고 무엇을 하는지 보여 주는 실행 예제를 모아 둔 곳입니다.
keywords: 세이버 메서드 예제, saver method examples, finalize, check_before_save, adjust_numbers, save, save_modified, cleanup, cleanup_finalize, map_messages, 저장 순서
---

## 설명

saver method(세이버 메서드)는 `COMMIT ENTITIES` 로 save sequence(저장 순서)가 시작된 뒤에 정해진 차례대로 불립니다. 설명만 읽어서는 어느 메서드가 언제 불리고 실패하면 어디로 가는지 감이 잘 오지 않습니다. 여기 모은 예제는 작은 RAP BO 로 그 흐름을 직접 보여 줍니다.

앞의 두 예제는 unmanaged BO 로 save sequence 전체를 따라갑니다. 가운데 두 예제는 managed BO 에서 저장 부분만 직접 구현하는 `save_modified` 를 다룹니다. 마지막 예제는 다른 BO 의 메시지를 옮기는 `map_messages` 를 다룹니다.

## 예제 목록

- [[abenabp_saver_class_abexa]] — unmanaged BO 에서 `finalize`, `check_before_save`, `save`, `cleanup`, `cleanup_finalize` 가 불리는 흐름을 보여 줍니다.
- [[abenabp_saver_ln_abexa]] — 위 예제에 late numbering 을 더해 `adjust_numbers` 까지 다룹니다.
- [[abensave_modified_add_save_abexa]] — additional save(`with additional save`)을 쓰는 managed BO 에서 `save_modified` 로 변경 기록을 남깁니다.
- [[abensave_modified_unm_save_abexa]] — unmanaged save(`with unmanaged save`)을 쓰는 managed BO 에서 `save_modified` 로 직접 데이터베이스에 씁니다.
- [[abenabp_map_messages_abexa]] — 외부 entity(엔터티)가 돌려준 메시지를 `map_messages` 에서 바꿔 넘깁니다.

## 관련 항목

- [[abenabp_saver_methods]]
- [[abenabp_saver_class]]
